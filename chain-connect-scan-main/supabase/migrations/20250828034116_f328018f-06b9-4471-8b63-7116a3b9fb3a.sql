-- CORRECTION COMPLÈTE DE LA SÉCURITÉ - PHASE 1: Tables Critiques
-- Analyse et correction des problèmes de sécurité identifiés

-- 1. CORRIGER LA TABLE RIDE_LOGS (CRITIQUE - Aucune politique)
CREATE POLICY "Users can view ride logs of their own rides"
ON public.ride_logs FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    ride_id IN (
      SELECT id FROM public.rides 
      WHERE client_id = auth.uid() OR driver_id IN (
        SELECT id FROM public.drivers WHERE user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "System can insert ride logs"
ON public.ride_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage all ride logs"
ON public.ride_logs FOR ALL
USING (private.user_has_role('admin'))
WITH CHECK (private.user_has_role('admin'));

-- 2. RENFORCER LES POLITIQUES DE SÉCURITÉ DES TABLES SENSIBLES

-- Corriger ORDERS - Politique multi-rôles stricte
DROP POLICY IF EXISTS "Verified users access related orders" ON public.orders;

CREATE POLICY "Clients can view their own orders"
ON public.orders FOR SELECT
USING (auth.uid() = customer_id);

CREATE POLICY "Sellers can view their orders"  
ON public.orders FOR SELECT
USING (auth.uid() = seller_id);

CREATE POLICY "Couriers can view assigned orders"
ON public.orders FOR SELECT  
USING (auth.uid() = courier_id);

CREATE POLICY "Clients can create orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Sellers can update their orders"
ON public.orders FOR UPDATE
USING (auth.uid() = seller_id);

CREATE POLICY "Couriers can update assigned orders"
ON public.orders FOR UPDATE  
USING (auth.uid() = courier_id);

CREATE POLICY "Admins can manage all orders"
ON public.orders FOR ALL
USING (private.user_has_role('admin'))
WITH CHECK (private.user_has_role('admin'));

-- 3. CORRIGER PRODUCTS - Sécurité vendeur stricte
DROP POLICY IF EXISTS "Authenticated users can view active products" ON public.products;
DROP POLICY IF EXISTS "Sellers can manage their own products" ON public.products;

CREATE POLICY "Public can view active products"
ON public.products FOR SELECT
USING (is_active = true);

CREATE POLICY "Sellers can view their own products"
ON public.products FOR SELECT
USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can manage their own products"
ON public.products FOR ALL
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Admins can manage all products"
ON public.products FOR ALL
USING (private.user_has_role('admin'))
WITH CHECK (private.user_has_role('admin'));

-- 4. SÉCURISER SHIPMENTS - Multi-rôles transitaires/clients
DROP POLICY IF EXISTS "Transitaires can update all shipments" ON public.shipments;
DROP POLICY IF EXISTS "Transitaires can view all shipments" ON public.shipments;
DROP POLICY IF EXISTS "Users can update their own shipments" ON public.shipments;
DROP POLICY IF EXISTS "Users can view their own shipments" ON public.shipments;

CREATE POLICY "Clients can view their shipments"
ON public.shipments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Transitaires can view assigned shipments"
ON public.shipments FOR SELECT
USING (
  private.user_has_role('transitaire') AND (
    forwarder_id IN (
      SELECT id FROM public.freight_forwarder_profiles 
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Clients can create shipments"
ON public.shipments FOR INSERT  
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Transitaires can update assigned shipments"
ON public.shipments FOR UPDATE
USING (
  private.user_has_role('transitaire') AND (
    forwarder_id IN (
      SELECT id FROM public.freight_forwarder_profiles 
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Admins can manage all shipments"
ON public.shipments FOR ALL
USING (private.user_has_role('admin'))
WITH CHECK (private.user_has_role('admin'));