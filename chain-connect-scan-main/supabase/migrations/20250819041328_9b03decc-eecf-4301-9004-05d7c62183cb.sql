-- Correction des politiques RLS pour sécuriser les données sensibles

-- 1. Corriger l'accès aux entrepôts - seuls les vendeurs propriétaires peuvent voir leurs entrepôts
DROP POLICY IF EXISTS "Anyone can view active warehouses" ON public.warehouses;

-- Seuls les vendeurs peuvent voir leurs propres entrepôts
CREATE POLICY "Sellers can view their own warehouses" 
ON public.warehouses 
FOR SELECT 
USING (auth.uid() = seller_id);

-- 2. Limiter l'accès aux produits - empêcher le scraping massif
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;

-- Permettre aux utilisateurs authentifiés de voir les produits actifs
CREATE POLICY "Authenticated users can view active products" 
ON public.products 
FOR SELECT 
USING (is_active = true AND auth.role() = 'authenticated');

-- 3. Créer une fonction pour obtenir des informations limitées d'entrepôt sans exposer l'adresse/téléphone
CREATE OR REPLACE FUNCTION public.get_warehouse_public_info(warehouse_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  country text,
  is_active boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT w.id, w.name, w.country, w.is_active
  FROM public.warehouses w
  WHERE w.id = warehouse_id AND w.is_active = true;
END;
$$;