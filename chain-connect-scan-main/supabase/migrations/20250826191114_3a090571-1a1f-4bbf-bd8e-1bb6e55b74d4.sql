-- Correction des politiques d'accès anonyme et ajout des politiques manquantes

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

-- 3. Tables payment_history - Historique des paiements
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their payment history" 
ON public.payment_history 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- 4. Table shipment_events - Événements d'expédition
ALTER TABLE public.shipment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events of their shipments" 
ON public.shipment_events 
FOR SELECT 
TO authenticated 
USING (
  shipment_id IN (
    SELECT id FROM shipments 
    WHERE customer_id = auth.uid() OR forwarder_id IN (
      SELECT id FROM freight_forwarders WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "System can manage shipment events" 
ON public.shipment_events 
FOR ALL 
TO authenticated 
USING (true);

-- 5. Table categories - Catégories de produits
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active categories" 
ON public.categories 
FOR SELECT 
TO authenticated 
USING (is_active = true);

CREATE POLICY "System can manage categories" 
ON public.categories 
FOR ALL 
TO authenticated 
USING (is_pdg_user());

-- 6. Corriger les politiques de stockage pour nécessiter l'authentification
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