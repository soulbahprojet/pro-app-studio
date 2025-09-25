-- CORRECTION COMPLÈTE DE LA SÉCURITÉ - PHASE 1 CORRIGÉE
-- Correction des politiques basée sur la structure réelle des tables

-- 1. CORRIGER LA TABLE RIDE_LOGS (CRITIQUE - Aucune politique) - déjà fait

-- 2. CORRIGER SHIPMENTS - Politique correcte sans forwarder_id
DROP POLICY IF EXISTS "Transitaires can view assigned shipments" ON public.shipments;
DROP POLICY IF EXISTS "Transitaires can update assigned shipments" ON public.shipments;

-- Pour les shipments réguliers (pas internationaux), seuls les clients peuvent les gérer
CREATE POLICY "Clients can update their shipments"
ON public.shipments FOR UPDATE
USING (auth.uid() = user_id);

-- 3. CORRIGER TOUS LES AUTRES TABLES AVEC POLITIQUES INSUFFISANTES

-- AUTOMATION_RULES - Renforcer sécurité vendeur
CREATE POLICY "Admins can manage automation rules"
ON public.automation_rules FOR ALL
USING (private.user_has_role('admin'))
WITH CHECK (private.user_has_role('admin'));

-- DEVICE_SECURITY - Ajouter politiques admin
CREATE POLICY "Admins can manage all device security"
ON public.device_security FOR ALL  
USING (private.user_has_role('admin'))
WITH CHECK (private.user_has_role('admin'));

-- FAVORITES - Ajouter politique admin et create
CREATE POLICY "Users can create favorites"
ON public.favorites FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all favorites"
ON public.favorites FOR ALL
USING (private.user_has_role('admin'))
WITH CHECK (private.user_has_role('admin'));

-- MANUAL_INVOICES - Ajouter sécurité complète
CREATE POLICY "Sellers can view their manual invoices"
ON public.manual_invoices FOR SELECT
USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can create manual invoices" 
ON public.manual_invoices FOR INSERT
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their manual invoices"
ON public.manual_invoices FOR UPDATE
USING (auth.uid() = seller_id);

CREATE POLICY "Admins can manage all manual invoices"
ON public.manual_invoices FOR ALL
USING (private.user_has_role('admin'))
WITH CHECK (private.user_has_role('admin'));

-- VENDOR_PROFILES - Renforcer sécurité
DROP POLICY IF EXISTS "vendors_own_profile" ON public.vendor_profiles;

CREATE POLICY "Vendors can view their own profile"
ON public.vendor_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Vendors can manage their own profile"
ON public.vendor_profiles FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all vendor profiles"
ON public.vendor_profiles FOR ALL
USING (private.user_has_role('admin'))
WITH CHECK (private.user_has_role('admin'));

-- VENDOR_WALLETS - Renforcer sécurité
DROP POLICY IF EXISTS "vendors_own_wallet" ON public.vendor_wallets;

CREATE POLICY "Vendors can view their own wallet"
ON public.vendor_wallets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Vendors can update their wallet"
ON public.vendor_wallets FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can manage vendor wallets"
ON public.vendor_wallets FOR ALL
WITH CHECK (true);

CREATE POLICY "Admins can manage all vendor wallets"
ON public.vendor_wallets FOR ALL
USING (private.user_has_role('admin'))
WITH CHECK (private.user_has_role('admin'));

-- VENDOR_TRANSACTIONS - Renforcer sécurité
DROP POLICY IF EXISTS "vendors_own_transactions" ON public.vendor_transactions;

CREATE POLICY "Vendors can view their own transactions"
ON public.vendor_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create vendor transactions"
ON public.vendor_transactions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage all vendor transactions"
ON public.vendor_transactions FOR ALL
USING (private.user_has_role('admin'))
WITH CHECK (private.user_has_role('admin'));