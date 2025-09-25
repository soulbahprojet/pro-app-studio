-- Créer les tables manquantes pour le système de fidélité

-- Table pour les clients fidèles (vérifier si existe)
CREATE TABLE IF NOT EXISTS public.loyalty_customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  seller_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  points INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  level TEXT DEFAULT 'bronze' CHECK (level IN ('bronze', 'silver', 'gold', 'platinum')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les transactions de points (vérifier si existe)
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES loyalty_customers(id),
  seller_id UUID NOT NULL REFERENCES auth.users(id),
  points_change INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'redeemed', 'expired', 'bonus')),
  order_id UUID,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les cartes cadeaux (vérifier si existe)
CREATE TABLE IF NOT EXISTS public.gift_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES auth.users(id),
  code TEXT NOT NULL UNIQUE,
  value NUMERIC NOT NULL,
  currency TEXT DEFAULT 'GNF',
  issued_to UUID REFERENCES auth.users(id),
  redeemed_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS sur les nouvelles tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'loyalty_customers' AND table_schema = 'public') THEN
    ALTER TABLE public.loyalty_customers ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'loyalty_transactions' AND table_schema = 'public') THEN
    ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gift_cards' AND table_schema = 'public') THEN
    ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Politiques RLS pour loyalty_customers
DROP POLICY IF EXISTS "Sellers can manage their loyalty customers" ON public.loyalty_customers;
CREATE POLICY "Sellers can manage their loyalty customers" 
ON public.loyalty_customers 
FOR ALL 
USING (auth.uid() = seller_id OR auth.uid() = user_id)
WITH CHECK (auth.uid() = seller_id OR auth.uid() = user_id);

-- Politiques RLS pour promotions (si la table existe)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'promotions' AND table_schema = 'public') THEN
    ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Sellers can manage their promotions" ON public.promotions;
    CREATE POLICY "Sellers can manage their promotions" 
    ON public.promotions 
    FOR ALL 
    USING (auth.uid() = seller_id)
    WITH CHECK (auth.uid() = seller_id);
    
    DROP POLICY IF EXISTS "Anyone can view active promotions" ON public.promotions;
    CREATE POLICY "Anyone can view active promotions" 
    ON public.promotions 
    FOR SELECT 
    USING (is_active = true AND start_date <= now() AND end_date >= now());
  END IF;
END $$;

-- Politiques RLS pour loyalty_transactions
DROP POLICY IF EXISTS "Sellers and customers can view loyalty transactions" ON public.loyalty_transactions;
CREATE POLICY "Sellers and customers can view loyalty transactions" 
ON public.loyalty_transactions 
FOR SELECT 
USING (auth.uid() = seller_id OR customer_id IN (
  SELECT id FROM loyalty_customers WHERE user_id = auth.uid()
));

DROP POLICY IF EXISTS "Sellers can create loyalty transactions" ON public.loyalty_transactions;
CREATE POLICY "Sellers can create loyalty transactions" 
ON public.loyalty_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = seller_id);

-- Politiques RLS pour gift_cards
DROP POLICY IF EXISTS "Sellers can manage their gift cards" ON public.gift_cards;
CREATE POLICY "Sellers can manage their gift cards" 
ON public.gift_cards 
FOR ALL 
USING (auth.uid() = seller_id OR auth.uid() = issued_to OR auth.uid() = redeemed_by)
WITH CHECK (auth.uid() = seller_id);