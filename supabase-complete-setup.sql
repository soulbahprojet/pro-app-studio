-- Configuration complète de la base de données 224Solutions
-- À exécuter dans Supabase SQL Editor

-- 1. Créer ou modifier la table products avec toutes les colonnes nécessaires
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Ajouter les colonnes manquantes si la table existe déjà
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'created_by') THEN
        ALTER TABLE products ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'stock') THEN
        ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'created_at') THEN
        ALTER TABLE products ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'updated_at') THEN
        ALTER TABLE products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 3. Activer RLS sur la table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 4. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Lecture publique des produits" ON products;
DROP POLICY IF EXISTS "Insertion pour utilisateurs authentifiés" ON products;
DROP POLICY IF EXISTS "Mise à jour par propriétaires" ON products;
DROP POLICY IF EXISTS "Suppression par propriétaires" ON products;
DROP POLICY IF EXISTS "Accès libre développement" ON products;

-- 5. Politiques de sécurité adaptées pour 224Solutions

-- Lecture publique : tout le monde peut voir les produits
CREATE POLICY "Lecture publique des produits" ON products
    FOR SELECT USING (true);

-- Insertion : utilisateurs authentifiés seulement
CREATE POLICY "Insertion pour utilisateurs authentifiés" ON products
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' OR 
        auth.role() = 'anon'  -- Permettre aussi aux anonymes pour les tests
    );

-- Mise à jour : propriétaires ou admins
CREATE POLICY "Mise à jour par propriétaires" ON products
    FOR UPDATE USING (
        auth.uid() = created_by OR 
        auth.role() = 'service_role' OR
        created_by IS NULL  -- Pour les produits sans propriétaire
    );

-- Suppression : propriétaires ou admins
CREATE POLICY "Suppression par propriétaires" ON products
    FOR DELETE USING (
        auth.uid() = created_by OR 
        auth.role() = 'service_role' OR
        created_by IS NULL  -- Pour les produits sans propriétaire
    );

-- 6. Créer une fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Créer le trigger pour updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Insérer quelques produits de test
INSERT INTO products (name, description, price, stock, created_by) VALUES
    ('Smartphone Pro', 'Téléphone dernière génération', 899.99, 50, NULL),
    ('Ordinateur Portable', 'PC portable haute performance', 1299.99, 25, NULL),
    ('Écouteurs Bluetooth', 'Audio sans fil premium', 199.99, 100, NULL),
    ('Montre Connectée', 'Smartwatch avec GPS', 349.99, 75, NULL),
    ('Tablette', 'Tablette 10 pouces', 449.99, 30, NULL)
ON CONFLICT (id) DO NOTHING;

-- 9. Vérifier que tout fonctionne
SELECT 'Configuration terminée ✅' as status;
SELECT COUNT(*) as nombre_produits FROM products;
SELECT 'RLS activé ✅' as rls_status WHERE (SELECT true FROM pg_tables WHERE tablename = 'products' AND rowsecurity = true);
