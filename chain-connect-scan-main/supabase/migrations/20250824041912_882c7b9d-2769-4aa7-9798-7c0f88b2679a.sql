-- Create virtual cards system
CREATE TYPE card_type AS ENUM ('basic', 'standard', 'premium');
CREATE TYPE card_status AS ENUM ('active', 'frozen', 'deleted');
CREATE TYPE transaction_type_card AS ENUM ('credit', 'debit', 'freeze', 'unfreeze', 'create', 'delete', 'rename');

-- Virtual cards table
CREATE TABLE public.virtual_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_name TEXT NOT NULL,
  card_number TEXT NOT NULL UNIQUE,
  cvv TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  card_type card_type NOT NULL DEFAULT 'basic',
  status card_status NOT NULL DEFAULT 'active',
  pin_hash TEXT, -- Encrypted PIN
  daily_limit NUMERIC DEFAULT 1000,
  transaction_limit NUMERIC DEFAULT 500,
  balance NUMERIC DEFAULT 0,
  currency currency_type DEFAULT 'GNF',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_employee_card BOOLEAN DEFAULT false,
  manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT valid_balance CHECK (balance >= 0),
  CONSTRAINT valid_limits CHECK (daily_limit >= 0 AND transaction_limit >= 0)
);

-- Card transactions table
CREATE TABLE public.card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES public.virtual_cards(id) ON DELETE CASCADE,
  transaction_type transaction_type_card NOT NULL,
  amount NUMERIC,
  currency currency_type DEFAULT 'GNF',
  description TEXT,
  merchant_name TEXT,
  location TEXT,
  reference_id TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Card daily usage tracking
CREATE TABLE public.card_daily_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  cards_created INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

-- Network sessions table for security
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  network_hash TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Notifications table
CREATE TABLE public.card_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id UUID REFERENCES public.virtual_cards(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.virtual_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_daily_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for virtual_cards
CREATE POLICY "Users can view their own cards" ON public.virtual_cards
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = manager_id);

CREATE POLICY "Users can insert their own cards" ON public.virtual_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cards" ON public.virtual_cards
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = manager_id);

CREATE POLICY "Users can delete their own cards" ON public.virtual_cards
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = manager_id);

-- RLS Policies for card_transactions
CREATE POLICY "Users can view their card transactions" ON public.card_transactions
  FOR SELECT USING (
    card_id IN (
      SELECT id FROM public.virtual_cards 
      WHERE user_id = auth.uid() OR manager_id = auth.uid()
    )
  );

CREATE POLICY "System can insert transactions" ON public.card_transactions
  FOR INSERT WITH CHECK (true);

-- RLS Policies for card_daily_usage
CREATE POLICY "Users can view their usage" ON public.card_daily_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their usage" ON public.card_daily_usage
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_sessions
CREATE POLICY "Users can view their sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their sessions" ON public.user_sessions
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for card_notifications
CREATE POLICY "Users can view their notifications" ON public.card_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.card_notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their notifications" ON public.card_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Helper functions
CREATE OR REPLACE FUNCTION generate_card_number()
RETURNS TEXT AS $$
DECLARE
  card_number TEXT;
  is_unique BOOLEAN := FALSE;
BEGIN
  WHILE NOT is_unique LOOP
    card_number := '4224' || LPAD(FLOOR(RANDOM() * 1000000000000)::TEXT, 12, '0');
    SELECT NOT EXISTS(SELECT 1 FROM public.virtual_cards WHERE card_number = generate_card_number.card_number) INTO is_unique;
  END LOOP;
  RETURN card_number;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_cvv()
RETURNS TEXT AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_virtual_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_virtual_cards_updated_at_trigger
  BEFORE UPDATE ON public.virtual_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_virtual_cards_updated_at();

-- Indexes for performance
CREATE INDEX idx_virtual_cards_user_id ON public.virtual_cards(user_id);
CREATE INDEX idx_virtual_cards_status ON public.virtual_cards(status);
CREATE INDEX idx_card_transactions_card_id ON public.card_transactions(card_id);
CREATE INDEX idx_card_transactions_created_at ON public.card_transactions(created_at);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON public.user_sessions(is_active);
CREATE INDEX idx_card_notifications_user_id ON public.card_notifications(user_id);