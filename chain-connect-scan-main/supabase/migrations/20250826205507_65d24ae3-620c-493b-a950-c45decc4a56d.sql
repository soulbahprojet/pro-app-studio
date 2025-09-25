-- CORRECTION SÉCURITAIRE CRITIQUE: Renforcement des politiques RLS pour empêcher l'accès croisé

-- 1. SÉCURISATION CRITIQUE de la table profiles  
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON profiles;

-- Politique stricte : chaque utilisateur ne peut voir que son propre profil
CREATE POLICY "Users can only view their own profile" ON profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only update their own profile" ON profiles  
FOR UPDATE USING (auth.uid() = user_id);

-- 2. SÉCURISATION CRITIQUE de la table orders
DROP POLICY IF EXISTS "Users can view all orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can view orders" ON orders;

-- Politiques strictes pour les commandes
CREATE POLICY "Customers can only view their own orders" ON orders
FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Sellers can only view orders for their products" ON orders  
FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Customers can create their own orders" ON orders
FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- 3. SÉCURISATION CRITIQUE de la table virtual_cards
DROP POLICY IF EXISTS "Users can view all cards" ON virtual_cards;
DROP POLICY IF EXISTS "Authenticated users can view virtual cards" ON virtual_cards;

-- Chaque utilisateur ne peut voir que ses propres cartes
CREATE POLICY "Users can only view their own virtual cards" ON virtual_cards
FOR SELECT USING (auth.uid() = user_id OR auth.uid() = manager_id);

CREATE POLICY "Users can only create their own virtual cards" ON virtual_cards
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own virtual cards" ON virtual_cards
FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = manager_id);

-- 4. SÉCURISATION de la table conversations
DROP POLICY IF EXISTS "Anyone can view messages" ON conversations;
DROP POLICY IF EXISTS "Authenticated users can view conversations" ON conversations;

CREATE POLICY "Users can only view their own conversations" ON conversations
FOR SELECT USING (auth.uid() = client_id OR auth.uid() = seller_id OR auth.uid() = support_id);

-- 5. NETTOYAGE des politiques trop permissives
-- Vérifier qu'aucune politique ne permet l'accès global non autorisé

-- 6. Fonction de sécurité pour audit simple
CREATE OR REPLACE FUNCTION public.audit_user_access(table_name TEXT, action TEXT)
RETURNS VOID AS $$
BEGIN
  -- Log simple des accès (peut être étendu)
  INSERT INTO security_tracking (user_id, action, details, created_at)
  VALUES (
    auth.uid(),
    action,
    jsonb_build_object('table', table_name, 'timestamp', now()),
    now()
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Ignore les erreurs d'audit pour ne pas bloquer l'application
    NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;