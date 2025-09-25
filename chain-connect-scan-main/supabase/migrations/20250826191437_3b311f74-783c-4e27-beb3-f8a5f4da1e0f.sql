-- Correction massive des politiques d'accès anonyme (Partie 1)
-- Restreindre toutes les politiques pour exiger l'authentification

-- 1. Corriger les politiques system/service role trop permissives
DROP POLICY IF EXISTS "Service role can manage admin roles" ON public.admin_roles;
CREATE POLICY "System can manage admin roles" 
ON public.admin_roles 
FOR ALL 
TO service_role 
USING (true);

-- 2. Corriger les politiques permettant l'accès système trop large
DROP POLICY IF EXISTS "System can manage affiliates" ON public.affiliates;
CREATE POLICY "System can manage affiliates" 
ON public.affiliates 
FOR ALL 
TO service_role 
USING (true);

DROP POLICY IF EXISTS "System can manage badges" ON public.badges;
CREATE POLICY "System can manage badges" 
ON public.badges 
FOR ALL 
TO service_role 
USING (true);

DROP POLICY IF EXISTS "System can insert transactions" ON public.card_transactions;
CREATE POLICY "System can insert transactions" 
ON public.card_transactions 
FOR INSERT 
TO service_role 
WITH CHECK (true);

DROP POLICY IF EXISTS "System can create notifications" ON public.card_notifications;
CREATE POLICY "System can create notifications" 
ON public.card_notifications 
FOR INSERT 
TO service_role 
WITH CHECK (true);

-- 3. Corriger les politiques de storage pour éliminer l'accès public
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view shop images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view shop images" ON storage.objects;

CREATE POLICY "Authenticated users can view product images" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can view shop images" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (bucket_id = 'shop-images');

CREATE POLICY "Authenticated users can view digital products" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (bucket_id = 'digital-products');

-- 4. Corriger les politiques de lecture publique
DROP POLICY IF EXISTS "Shipping rates are publicly readable" ON public.shipping_rates_matrix;
CREATE POLICY "Authenticated users can view shipping rates" 
ON public.shipping_rates_matrix 
FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Analytics are readable by all" ON public.shipment_analytics;
CREATE POLICY "Authenticated users can view analytics" 
ON public.shipment_analytics 
FOR SELECT 
TO authenticated 
USING (true);