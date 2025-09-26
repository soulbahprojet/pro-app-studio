-- Politiques RLS pour la table products - 224Solutions
-- Ces politiques permettent l'accès sécurisé aux données

-- 1. Politique de lecture publique (tout le monde peut voir les produits)
CREATE POLICY "Lecture publique des produits" ON products
FOR SELECT USING (true);

-- 2. Politique d'insertion pour les utilisateurs authentifiés
CREATE POLICY "Insertion pour utilisateurs authentifiés" ON products
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. Politique de mise à jour pour les propriétaires ou admins
CREATE POLICY "Mise à jour par propriétaires" ON products
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND (
    auth.uid()::text = created_by OR
    auth.jwt() ->> 'role' = 'admin'
  )
);

-- 4. Politique de suppression pour les propriétaires ou admins
CREATE POLICY "Suppression par propriétaires" ON products
FOR DELETE USING (
  auth.uid() IS NOT NULL AND (
    auth.uid()::text = created_by OR
    auth.jwt() ->> 'role' = 'admin'
  )
);

-- 5. Alternative simple pour les tests : Accès complet pour les authentifiés
-- Décommentez cette politique si vous voulez un accès complet pour tous les utilisateurs connectés
/*
DROP POLICY IF EXISTS "Accès complet pour authentifiés" ON products;
CREATE POLICY "Accès complet pour authentifiés" ON products
FOR ALL USING (auth.role() = 'authenticated');
*/

-- 6. Politique super permissive pour le développement (À SUPPRIMER EN PRODUCTION)
-- Décommentez UNIQUEMENT pour les tests de développement
/*
DROP POLICY IF EXISTS "Accès libre développement" ON products;
CREATE POLICY "Accès libre développement" ON products
FOR ALL USING (true);
*/
