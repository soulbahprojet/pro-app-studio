-- Create user_debts table
CREATE TABLE public.user_debts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  debtor_id UUID NOT NULL,
  creditor_id UUID NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency currency_type NOT NULL DEFAULT 'GNF',
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partially_paid', 'paid')),
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create debt_payments table
CREATE TABLE public.debt_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  debt_id UUID NOT NULL REFERENCES public.user_debts(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency currency_type NOT NULL DEFAULT 'GNF',
  payment_method TEXT,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  recorded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create debt_reminders table
CREATE TABLE public.debt_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  debt_id UUID NOT NULL REFERENCES public.user_debts(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL DEFAULT 'email' CHECK (reminder_type IN ('email', 'notification', 'sms')),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_debts
CREATE POLICY "Users can view their debts" ON public.user_debts
  FOR SELECT USING (auth.uid() = debtor_id OR auth.uid() = creditor_id);

CREATE POLICY "PDG can manage all debts" ON public.user_debts
  FOR ALL USING (is_pdg_user());

CREATE POLICY "Agents can view debts for their users" ON public.user_debts
  FOR SELECT USING (
    creditor_id IN (
      SELECT id FROM agents 
      WHERE pgd_id = auth.uid() 
      OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = auth.uid() AND email = agents.email
      )
    )
  );

-- RLS Policies for debt_payments
CREATE POLICY "Users can view payments for their debts" ON public.debt_payments
  FOR SELECT USING (
    debt_id IN (
      SELECT id FROM user_debts 
      WHERE debtor_id = auth.uid() OR creditor_id = auth.uid()
    )
  );

CREATE POLICY "PDG can manage all payments" ON public.debt_payments
  FOR ALL USING (is_pdg_user());

CREATE POLICY "Agents can view payments for their debts" ON public.debt_payments
  FOR SELECT USING (
    debt_id IN (
      SELECT id FROM user_debts 
      WHERE creditor_id IN (
        SELECT id FROM agents 
        WHERE pgd_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM profiles 
          WHERE user_id = auth.uid() AND email = agents.email
        )
      )
    )
  );

-- RLS Policies for debt_reminders
CREATE POLICY "PDG can manage all reminders" ON public.debt_reminders
  FOR ALL USING (is_pdg_user());

CREATE POLICY "Agents can view reminders for their debts" ON public.debt_reminders
  FOR SELECT USING (
    debt_id IN (
      SELECT id FROM user_debts 
      WHERE creditor_id IN (
        SELECT id FROM agents 
        WHERE pgd_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM profiles 
          WHERE user_id = auth.uid() AND email = agents.email
        )
      )
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_user_debts_updated_at
  BEFORE UPDATE ON public.user_debts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate remaining debt
CREATE OR REPLACE FUNCTION public.calculate_remaining_debt(debt_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_debt NUMERIC;
  total_payments NUMERIC;
BEGIN
  SELECT amount INTO total_debt FROM user_debts WHERE id = debt_id;
  
  SELECT COALESCE(SUM(amount), 0) INTO total_payments 
  FROM debt_payments WHERE debt_payments.debt_id = calculate_remaining_debt.debt_id;
  
  RETURN total_debt - total_payments;
END;
$$;