-- Ajouter les colonnes nécessaires pour les codes de transaction et services de proximité
ALTER TABLE orders ADD COLUMN IF NOT EXISTS transaction_code TEXT;

-- Créer une séquence pour les codes de transaction 
CREATE SEQUENCE IF NOT EXISTS transaction_code_seq START 1;

-- Fonction pour générer un code de transaction (1 lettre + 3 chiffres)
CREATE OR REPLACE FUNCTION generate_transaction_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  letter_code TEXT;
  number_part TEXT;
  full_code TEXT;
BEGIN
  -- Générer une lettre aléatoire de A à Z
  letter_code := chr(65 + floor(random() * 26)::int);
  
  -- Générer un nombre à 3 chiffres
  number_part := LPAD(nextval('transaction_code_seq')::TEXT, 3, '0');
  
  -- Si le nombre dépasse 999, remettre la séquence à 1
  IF nextval('transaction_code_seq') > 999 THEN
    ALTER SEQUENCE transaction_code_seq RESTART WITH 1;
    number_part := '001';
  END IF;
  
  full_code := letter_code || number_part;
  
  RETURN full_code;
END;
$$;

-- Créer une table pour les services à proximité
CREATE TABLE IF NOT EXISTS services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('motard', 'livreur', 'boutique', 'other')),
  country TEXT NOT NULL,
  latitude DECIMAL,
  longitude DECIMAL,
  phone TEXT,
  email TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur la table services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre à tous les utilisateurs authentifiés de voir les services actifs
CREATE POLICY "Users can view active services" 
ON services 
FOR SELECT 
USING (is_active = true AND auth.role() = 'authenticated');

-- Créer une table pour les conversations/messagerie
CREATE TABLE IF NOT EXISTS conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  seller_id UUID,
  support_id UUID,
  subject TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur les conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Politiques pour les conversations
CREATE POLICY "Users can view their conversations" 
ON conversations 
FOR SELECT 
USING (auth.uid() = client_id OR auth.uid() = seller_id OR auth.uid() = support_id);

CREATE POLICY "Users can create conversations" 
ON conversations 
FOR INSERT 
WITH CHECK (auth.uid() = client_id);

-- Créer une table pour les messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur les messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Politiques pour les messages
CREATE POLICY "Users can view messages in their conversations" 
ON messages 
FOR SELECT 
USING (conversation_id IN (
  SELECT id FROM conversations 
  WHERE auth.uid() = client_id OR auth.uid() = seller_id OR auth.uid() = support_id
));

CREATE POLICY "Users can insert messages in their conversations" 
ON messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND 
  conversation_id IN (
    SELECT id FROM conversations 
    WHERE auth.uid() = client_id OR auth.uid() = seller_id OR auth.uid() = support_id
  )
);

-- Créer une table pour les favoris
CREATE TABLE IF NOT EXISTS favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('product', 'shop', 'service')),
  item_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur les favoris
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Index unique pour éviter les doublons
CREATE UNIQUE INDEX IF NOT EXISTS favorites_user_item_unique 
ON favorites(user_id, item_type, item_id);

-- Politiques pour les favoris
CREATE POLICY "Users can manage their favorites" 
ON favorites 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ajouter des triggers
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();