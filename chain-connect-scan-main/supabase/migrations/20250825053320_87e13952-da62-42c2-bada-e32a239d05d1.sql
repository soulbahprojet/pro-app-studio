-- Vérifier et corriger les politiques RLS pour la table products
-- Supprimer les anciennes politiques s'il y en a
DROP POLICY IF EXISTS "Sellers can manage their products" ON products;
DROP POLICY IF EXISTS "Public can view active products" ON products;

-- Créer les bonnes politiques RLS pour products
CREATE POLICY "Sellers can manage their own products"
ON products
FOR ALL
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Public can view active products"
ON products
FOR SELECT
USING (is_active = true);

-- S'assurer que RLS est activé
ALTER TABLE products ENABLE ROW LEVEL SECURITY;