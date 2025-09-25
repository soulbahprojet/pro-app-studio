-- Créer les tables pour le système de fidélité

-- Table pour les clients fidèles
CREATE TABLE public.loyalty_customers (
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

-- Table pour les promotions
CREATE TABLE public.promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed', 'points')),
  value NUMERIC NOT NULL,
  min_purchase NUMERIC DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les transactions de points
CREATE TABLE public.loyalty_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES loyalty_customers(id),
  seller_id UUID NOT NULL REFERENCES auth.users(id),
  points_change INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'redeemed', 'expired', 'bonus')),
  order_id UUID,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les cartes cadeaux
CREATE TABLE public.gift_cards (
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

-- Activer RLS
ALTER TABLE public.loyalty_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour loyalty_customers
CREATE POLICY "Sellers can manage their loyalty customers" 
ON public.loyalty_customers 
FOR ALL 
USING (auth.uid() = seller_id OR auth.uid() = user_id)
WITH CHECK (auth.uid() = seller_id OR auth.uid() = user_id);

-- Politiques RLS pour promotions
CREATE POLICY "Sellers can manage their promotions" 
ON public.promotions 
FOR ALL 
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Anyone can view active promotions" 
ON public.promotions 
FOR SELECT 
USING (is_active = true AND start_date <= now() AND end_date >= now());

-- Politiques RLS pour loyalty_transactions
CREATE POLICY "Sellers and customers can view loyalty transactions" 
ON public.loyalty_transactions 
FOR SELECT 
USING (auth.uid() = seller_id OR customer_id IN (
  SELECT id FROM loyalty_customers WHERE user_id = auth.uid()
));

CREATE POLICY "Sellers can create loyalty transactions" 
ON public.loyalty_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = seller_id);

-- Politiques RLS pour gift_cards
CREATE POLICY "Sellers can manage their gift cards" 
ON public.gift_cards 
FOR ALL 
USING (auth.uid() = seller_id OR auth.uid() = issued_to OR auth.uid() = redeemed_by)
WITH CHECK (auth.uid() = seller_id);

-- Fonction pour mettre à jour le niveau de fidélité
CREATE OR REPLACE FUNCTION update_loyalty_level()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculer le nouveau niveau basé sur les dépenses totales
  IF NEW.total_spent >= 500000 THEN
    NEW.level = 'platinum';
  ELSIF NEW.total_spent >= 200000 THEN
    NEW.level = 'gold';
  ELSIF NEW.total_spent >= 50000 THEN
    NEW.level = 'silver';
  ELSE
    NEW.level = 'bronze';
  END IF;
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement le niveau de fidélité
CREATE TRIGGER update_loyalty_level_trigger
  BEFORE UPDATE ON public.loyalty_customers
  FOR EACH ROW
  EXECUTE FUNCTION update_loyalty_level();

-- Fonction pour générer un code de carte cadeau unique
CREATE OR REPLACE FUNCTION generate_gift_card_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
BEGIN
  -- Générer un code aléatoire de 8 caractères
  code := UPPER(substring(md5(random()::text) from 1 for 8));
  
  -- Vérifier s'il n'existe pas déjà
  WHILE EXISTS (SELECT 1 FROM gift_cards WHERE gift_cards.code = code) LOOP
    code := UPPER(substring(md5(random()::text) from 1 for 8));
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;