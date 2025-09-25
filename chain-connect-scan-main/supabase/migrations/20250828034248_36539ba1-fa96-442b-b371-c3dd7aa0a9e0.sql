-- CORRECTION COMPLÈTE DE LA SÉCURITÉ - PHASE 1 CORRIGÉE (bis)
-- Correction avec les noms de colonnes corrects

-- 1. VENDOR_WALLETS - Utiliser vendor_id, pas user_id
DROP POLICY IF EXISTS "vendors_own_wallet" ON public.vendor_wallets;
DROP POLICY IF EXISTS "Vendors can view their own wallet" ON public.vendor_wallets;
DROP POLICY IF EXISTS "Vendors can update their wallet" ON public.vendor_wallets;
DROP POLICY IF EXISTS "System can manage vendor wallets" ON public.vendor_wallets;
DROP POLICY IF EXISTS "Admins can manage all vendor wallets" ON public.vendor_wallets;

CREATE POLICY "Vendors can view their own wallet"
ON public.vendor_wallets FOR SELECT
USING (
  vendor_id IN (
    SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Vendors can update their wallet"
ON public.vendor_wallets FOR UPDATE
USING (
  vendor_id IN (
    SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "System can manage vendor wallets"
ON public.vendor_wallets FOR ALL
WITH CHECK (true);

CREATE POLICY "Admins can manage all vendor wallets"
ON public.vendor_wallets FOR ALL
USING (private.user_has_role('admin'))
WITH CHECK (private.user_has_role('admin'));

-- 2. VENDOR_TRANSACTIONS - Utiliser vendor_id
DROP POLICY IF EXISTS "vendors_own_transactions" ON public.vendor_transactions;
DROP POLICY IF EXISTS "Vendors can view their own transactions" ON public.vendor_transactions;
DROP POLICY IF EXISTS "System can create vendor transactions" ON public.vendor_transactions;
DROP POLICY IF EXISTS "Admins can manage all vendor transactions" ON public.vendor_transactions;

CREATE POLICY "Vendors can view their own transactions"
ON public.vendor_transactions FOR SELECT
USING (
  vendor_id IN (
    SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "System can create vendor transactions"
ON public.vendor_transactions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage all vendor transactions"
ON public.vendor_transactions FOR ALL
USING (private.user_has_role('admin'))
WITH CHECK (private.user_has_role('admin'));

-- 3. CORRIGER TOUTES LES AUTRES TABLES IMPORTANTES

-- PAYOUT_REQUESTS - Ajouter sécurité complète
DROP POLICY IF EXISTS "vendors_own_payouts" ON public.payout_requests;

CREATE POLICY "Vendors can view their payout requests"
ON public.payout_requests FOR SELECT
USING (
  vendor_id IN (
    SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Vendors can create payout requests"
ON public.payout_requests FOR INSERT
WITH CHECK (
  vendor_id IN (
    SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all payout requests"
ON public.payout_requests FOR ALL
USING (private.user_has_role('admin'))
WITH CHECK (private.user_has_role('admin'));

-- STOCK_LOGS - Corriger politique
DROP POLICY IF EXISTS "vendors_own_stock_logs" ON public.stock_logs;

CREATE POLICY "Sellers can view their stock logs"
ON public.stock_logs FOR SELECT
USING (auth.uid() = seller_id);

CREATE POLICY "System can create stock logs"
ON public.stock_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage all stock logs"
ON public.stock_logs FOR ALL
USING (private.user_has_role('admin'))
WITH CHECK (private.user_has_role('admin'));

-- INVENTORY - Corriger politique existante
DROP POLICY IF EXISTS "vendors_own_inventory" ON public.inventory;
DROP POLICY IF EXISTS "Vendeurs gèrent leur inventaire" ON public.inventory;

CREATE POLICY "Sellers can manage their inventory"
ON public.inventory FOR ALL
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Admins can manage all inventory"
ON public.inventory FOR ALL
USING (private.user_has_role('admin'))
WITH CHECK (private.user_has_role('admin'));