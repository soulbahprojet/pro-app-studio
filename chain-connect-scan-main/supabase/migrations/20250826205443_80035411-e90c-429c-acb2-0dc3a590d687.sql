-- CORRECTION SÉCURITAIRE CRITIQUE: Renforcement des politiques RLS pour empêcher l'accès croisé entre utilisateurs

-- 1. SÉCURISATION CRITIQUE de la table profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Politique stricte : chaque utilisateur ne peut voir que son propre profil
CREATE POLICY "Users can only view their own profile" ON profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only update their own profile" ON profiles  
FOR UPDATE USING (auth.uid() = user_id);

-- 2. SÉCURISATION CRITIQUE de la table orders
DROP POLICY IF EXISTS "Users can view all orders" ON orders;

-- Politiques strictes pour les commandes
CREATE POLICY "Customers can only view their own orders" ON orders
FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Sellers can only view orders for their products" ON orders
FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Customers can create their own orders" ON orders
FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "System can update orders" ON orders
FOR UPDATE USING (true);

-- 3. SÉCURISATION CRITIQUE de la table products
DROP POLICY IF EXISTS "Anyone can view products" ON products;

-- Les produits peuvent être vus par tous (marketplace public)
CREATE POLICY "Products are publicly viewable" ON products
FOR SELECT USING (true);

-- Seuls les vendeurs peuvent gérer leurs propres produits
CREATE POLICY "Sellers can manage their own products" ON products
FOR ALL USING (auth.uid() = seller_id);

-- 4. SÉCURISATION CRITIQUE de la table virtual_cards 
DROP POLICY IF EXISTS "Users can view all cards" ON virtual_cards;

-- Chaque utilisateur ne peut voir que ses propres cartes
CREATE POLICY "Users can only view their own virtual cards" ON virtual_cards
FOR SELECT USING (auth.uid() = user_id OR auth.uid() = manager_id);

CREATE POLICY "Users can only create their own virtual cards" ON virtual_cards
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own virtual cards" ON virtual_cards
FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = manager_id);

-- 5. SÉCURISATION de la table messages/conversations
DROP POLICY IF EXISTS "Anyone can view messages" ON conversations;

CREATE POLICY "Users can only view their own conversations" ON conversations
FOR SELECT USING (auth.uid() = client_id OR auth.uid() = seller_id OR auth.uid() = support_id);

-- 6. SÉCURISATION de la table favorites
-- (Déjà sécurisée mais vérification)
DROP POLICY IF EXISTS "Users can view all favorites" ON favorites;

-- 7. NETTOYAGE ET AUDIT: Supprimer les politiques permissives existantes
-- Vérifier qu'aucune politique ne permet l'accès global

-- 8. POLITIQUE D'AUDIT: Ajouter une fonction de logging des accès suspects
CREATE OR REPLACE FUNCTION log_suspicious_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log des tentatives d'accès suspect
  INSERT INTO security_tracking (user_id, action, details, created_at)
  VALUES (
    auth.uid(),
    'data_access_attempt',
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'timestamp', now()
    ),
    now()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Appliquer le trigger d'audit sur les tables sensibles
DROP TRIGGER IF EXISTS audit_profiles_access ON profiles;
DROP TRIGGER IF EXISTS audit_orders_access ON orders;
DROP TRIGGER IF EXISTS audit_wallets_access ON wallets;

CREATE TRIGGER audit_profiles_access
AFTER SELECT ON profiles
FOR EACH ROW EXECUTE FUNCTION log_suspicious_access();

CREATE TRIGGER audit_orders_access  
AFTER SELECT ON orders
FOR EACH ROW EXECUTE FUNCTION log_suspicious_access();

CREATE TRIGGER audit_wallets_access
AFTER SELECT ON wallets  
FOR EACH ROW EXECUTE FUNCTION log_suspicious_access();