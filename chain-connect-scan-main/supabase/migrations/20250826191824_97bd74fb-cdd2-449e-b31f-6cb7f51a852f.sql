-- Correction massive des politiques d'accès anonyme (Partie 2)
-- Continuer la restriction des politiques pour exiger l'authentification

-- 5. Corriger les politiques de système de transport/livraison
DROP POLICY IF EXISTS "System can manage deliveries" ON public.delivery_tracking;
CREATE POLICY "System can manage deliveries" 
ON public.delivery_tracking 
FOR ALL 
TO service_role 
USING (true);

DROP POLICY IF EXISTS "System can manage digital access" ON public.digital_access;
CREATE POLICY "System can manage digital access" 
ON public.digital_access 
FOR ALL 
TO service_role 
USING (true);

DROP POLICY IF EXISTS "System can insert sales" ON public.digital_sales;
CREATE POLICY "System can insert sales" 
ON public.digital_sales 
FOR INSERT 
TO service_role 
WITH CHECK (true);

-- 6. Corriger les politiques d'escrow et transactions
DROP POLICY IF EXISTS "System can manage escrow transactions" ON public.escrow_transactions;
CREATE POLICY "System can manage escrow transactions" 
ON public.escrow_transactions 
FOR ALL 
TO service_role 
USING (true);

DROP POLICY IF EXISTS "System can update exchange rates" ON public.exchange_rates;
CREATE POLICY "System can update exchange rates" 
ON public.exchange_rates 
FOR ALL 
TO service_role 
USING (true);

-- 7. Corriger les politiques de détection de fraude
DROP POLICY IF EXISTS "System can manage fraud detection" ON public.fraud_detection;
CREATE POLICY "System can manage fraud detection" 
ON public.fraud_detection 
FOR ALL 
TO service_role 
USING (true);

-- 8. Corriger les politiques de tarification publique
DROP POLICY IF EXISTS "Anyone can view freight rates" ON public.freight_rates;
DROP POLICY IF EXISTS "Public can view freight rates" ON public.freight_rates;
CREATE POLICY "Authenticated users can view freight rates" 
ON public.freight_rates 
FOR SELECT 
TO authenticated 
USING (true);

-- 9. Corriger les politiques de transporteurs
DROP POLICY IF EXISTS "Anyone can view active carriers" ON public.carrier_options;
DROP POLICY IF EXISTS "Public can view active carriers" ON public.carrier_options;
CREATE POLICY "Authenticated users can view active carriers" 
ON public.carrier_options 
FOR SELECT 
TO authenticated 
USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can view carrier performance" ON public.carrier_performance;
DROP POLICY IF EXISTS "Public can view carrier performance" ON public.carrier_performance;
CREATE POLICY "Authenticated users can view carrier performance" 
ON public.carrier_performance 
FOR SELECT 
TO authenticated 
USING (true);

-- 10. Corriger les politiques de catégories et produits
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.digital_categories;
DROP POLICY IF EXISTS "Public can view active categories" ON public.digital_categories;
CREATE POLICY "Authenticated users can view active categories" 
ON public.digital_categories 
FOR SELECT 
TO authenticated 
USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can view active shops" ON public.digital_shops;
DROP POLICY IF EXISTS "Public can view active shops" ON public.digital_shops;
CREATE POLICY "Authenticated users can view active shops" 
ON public.digital_shops 
FOR SELECT 
TO authenticated 
USING (is_active = true);

-- 11. Corriger les politiques système trop larges
DROP POLICY IF EXISTS "All can view currencies" ON public.currencies;
DROP POLICY IF EXISTS "Public can view currencies" ON public.currencies;
CREATE POLICY "Authenticated users can view currencies" 
ON public.currencies 
FOR SELECT 
TO authenticated 
USING (status = 'active');

DROP POLICY IF EXISTS "All can view country currencies" ON public.country_currencies;
DROP POLICY IF EXISTS "Public can view country currencies" ON public.country_currencies;
CREATE POLICY "Authenticated users can view country currencies" 
ON public.country_currencies 
FOR SELECT 
TO authenticated 
USING (true);