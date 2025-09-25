-- Correction des politiques d'accès anonyme (tables existantes seulement)

-- 1. Corriger les politiques trop permissives pour nécessiter l'authentification
DROP POLICY IF EXISTS "Country currencies are readable by everyone" ON public.country_currencies;
CREATE POLICY "Country currencies readable by authenticated users" 
ON public.country_currencies 
FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Currencies are readable by everyone" ON public.currencies;
CREATE POLICY "Currencies readable by authenticated users" 
ON public.currencies 
FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Exchange rates are readable by everyone" ON public.exchange_rates;
CREATE POLICY "Exchange rates readable by authenticated users" 
ON public.exchange_rates 
FOR SELECT 
TO authenticated 
USING (true);

-- 2. Corriger les politiques d'accès aux boutiques
DROP POLICY IF EXISTS "Anyone can view active shops" ON public.digital_shops;
CREATE POLICY "Authenticated users can view active shops" 
ON public.digital_shops 
FOR SELECT 
TO authenticated 
USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can view categories" ON public.digital_categories;
CREATE POLICY "Authenticated users can view active categories" 
ON public.digital_categories 
FOR SELECT 
TO authenticated 
USING (is_active = true);

-- 3. Corriger les politiques de produits pour restreindre l'accès
DROP POLICY IF EXISTS "Authenticated users can view active products" ON public.products;
CREATE POLICY "Users can view active products" 
ON public.products 
FOR SELECT 
TO authenticated 
USING (is_active = true AND status = 'active');

-- 4. Corriger les politiques de stockage pour nécessiter l'authentification
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
CREATE POLICY "Authenticated users can view product images" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Anyone can view shop images" ON storage.objects;  
CREATE POLICY "Authenticated users can view shop images" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (bucket_id = 'shop-images');

-- 5. Restreindre l'accès aux options de transporteurs
DROP POLICY IF EXISTS "Carrier options are readable by all" ON public.carrier_options;
CREATE POLICY "Authenticated users can view active carriers" 
ON public.carrier_options 
FOR SELECT 
TO authenticated 
USING (is_active = true);

-- 6. Restreindre l'accès aux performances des transporteurs
DROP POLICY IF EXISTS "Carrier performance is readable by all" ON public.carrier_performance;
CREATE POLICY "Authenticated users can view carrier performance" 
ON public.carrier_performance 
FOR SELECT 
TO authenticated 
USING (true);