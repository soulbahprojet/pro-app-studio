-- Correction massive des politiques d'accès anonyme (Partie 2 - Correctif)
-- Continuer la restriction des politiques en évitant les doublons

-- 5. Corriger les politiques de système transport/livraison (uniquement service_role)
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

-- 6. Corriger les politiques d'escrow et transactions (service_role uniquement)
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

-- 7. Corriger les politiques de détection de fraude (service_role uniquement)
DROP POLICY IF EXISTS "System can manage fraud detection" ON public.fraud_detection;
CREATE POLICY "System can manage fraud detection" 
ON public.fraud_detection 
FOR ALL 
TO service_role 
USING (true);

-- 8. Corriger seulement les nouvelles politiques sans conflits
DROP POLICY IF EXISTS "All can view currencies" ON public.currencies;
DROP POLICY IF EXISTS "Public can view currencies" ON public.currencies;

-- Vérifier si la politique n'existe pas déjà avant de la créer
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'currencies' 
        AND policyname = 'Authenticated users can view currencies'
    ) THEN
        CREATE POLICY "Authenticated users can view currencies" 
        ON public.currencies 
        FOR SELECT 
        TO authenticated 
        USING (status = 'active');
    END IF;
END $$;