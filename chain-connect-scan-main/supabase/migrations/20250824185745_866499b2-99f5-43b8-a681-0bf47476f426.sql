-- Mise à jour de la table virtual_cards pour Stripe Issuing
ALTER TABLE virtual_cards 
ADD COLUMN IF NOT EXISTS stripe_card_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_cardholder_id TEXT,
ADD COLUMN IF NOT EXISTS spending_controls JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS shipping_address JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS card_type_stripe TEXT DEFAULT 'virtual',
ADD COLUMN IF NOT EXISTS last_four TEXT,
ALTER COLUMN card_number DROP NOT NULL,
ALTER COLUMN cvv DROP NOT NULL,
ALTER COLUMN expiry_date DROP NOT NULL;

-- Créer une table pour les cardholders Stripe
CREATE TABLE IF NOT EXISTS stripe_cardholders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stripe_cardholder_id TEXT NOT NULL UNIQUE,
  individual JSONB NOT NULL,
  billing JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE stripe_cardholders ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour cardholders
CREATE POLICY "Users can view their own cardholders" 
ON stripe_cardholders 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own cardholders" 
ON stripe_cardholders 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own cardholders" 
ON stripe_cardholders 
FOR UPDATE 
USING (user_id = auth.uid());

-- Mettre à jour les politiques RLS pour virtual_cards si elles existent
DROP POLICY IF EXISTS "Users can view their own virtual cards" ON virtual_cards;
DROP POLICY IF EXISTS "Users can create virtual cards" ON virtual_cards;
DROP POLICY IF EXISTS "Users can update their own virtual cards" ON virtual_cards;
DROP POLICY IF EXISTS "Users can delete their own virtual cards" ON virtual_cards;

CREATE POLICY "Users can view their own virtual cards" 
ON virtual_cards 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create virtual cards" 
ON virtual_cards 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own virtual cards" 
ON virtual_cards 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own virtual cards" 
ON virtual_cards 
FOR DELETE 
USING (user_id = auth.uid());

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_virtual_cards_stripe_card_id ON virtual_cards(stripe_card_id);
CREATE INDEX IF NOT EXISTS idx_cardholders_user_id ON stripe_cardholders(user_id);
CREATE INDEX IF NOT EXISTS idx_cardholders_stripe_id ON stripe_cardholders(stripe_cardholder_id);