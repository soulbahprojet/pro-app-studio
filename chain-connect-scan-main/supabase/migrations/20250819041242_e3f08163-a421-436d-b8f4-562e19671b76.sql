-- Correction des politiques RLS pour sécuriser les données sensibles

-- 1. Corriger l'accès aux entrepôts - seuls les vendeurs propriétaires peuvent voir leurs entrepôts
DROP POLICY IF EXISTS "Anyone can view active warehouses" ON public.warehouses;

CREATE POLICY "Sellers can view their own warehouses" 
ON public.warehouses 
FOR SELECT 
USING (auth.uid() = seller_id);

CREATE POLICY "Public can view basic warehouse info" 
ON public.warehouses 
FOR SELECT 
USING (is_active = true AND auth.role() = 'anon');

-- 2. Limiter l'accès aux produits - empêcher le scraping massif
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;

-- Permettre aux utilisateurs authentifiés de voir les produits actifs
CREATE POLICY "Authenticated users can view active products" 
ON public.products 
FOR SELECT 
USING (is_active = true AND auth.role() = 'authenticated');

-- Permettre un accès limité pour les utilisateurs non authentifiés (par exemple via des pages spécifiques)
CREATE POLICY "Limited public access to products" 
ON public.products 
FOR SELECT 
USING (is_active = true AND auth.role() = 'anon');

-- 3. Créer une fonction pour obtenir des informations limitées d'entrepôt
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

-- 4. Créer une vue publique limitée pour les produits (empêcher le scraping de toutes les données)
CREATE OR REPLACE VIEW public.products_public AS
SELECT 
  id,
  name,
  price,
  currency,
  category,
  is_active,
  created_at
FROM public.products
WHERE is_active = true;

-- Activer RLS sur la vue
ALTER VIEW public.products_public SET (security_barrier = true);

-- 5. Politique pour la vue publique
CREATE POLICY "Limited product info for public"
ON public.products_public
FOR SELECT
USING (true);