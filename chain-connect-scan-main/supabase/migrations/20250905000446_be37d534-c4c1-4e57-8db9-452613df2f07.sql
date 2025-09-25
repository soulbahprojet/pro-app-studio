-- ---------------------------
-- 0. Préliminaires / safety
-- ---------------------------
-- Créer schema private
CREATE SCHEMA IF NOT EXISTS private;

-- ---------------------------
-- 1. Tables clés (si elles n'existent pas déjà)
-- ---------------------------

CREATE TABLE IF NOT EXISTS public.seller_shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  slug text UNIQUE,
  description text,
  location jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stock_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id),
  change integer NOT NULL,
  reason text,
  actor_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

-- ---------------------------
-- 2. Fonctions helper sécurisées
-- ---------------------------
-- current_auth_uid
CREATE OR REPLACE FUNCTION private.current_auth_uid()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, private
AS $$
  SELECT auth.uid();
$$;

-- user_has_role
CREATE OR REPLACE FUNCTION private.user_has_role(role_name text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, private
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = role_name
  );
$$;

-- vendor_has_active_subscription
CREATE OR REPLACE FUNCTION public.vendor_has_active_subscription(vendor uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, private
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.vendor_subscriptions vs
    WHERE vs.vendor_id = vendor AND vs.status = true AND (vs.end_date IS NULL OR vs.end_date > now())
  );
$$;

-- ---------------------------
-- 3. Activation RLS + Policies pour tables vendeur
-- ---------------------------

-- products: public can read visible items; seller can manage own products
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS products_public_view ON public.products;
CREATE POLICY products_public_view ON public.products
  FOR SELECT
  TO public
  USING (is_active = true);

DROP POLICY IF EXISTS products_manage_own ON public.products;
CREATE POLICY products_manage_own ON public.products
  FOR ALL
  TO authenticated
  USING (seller_id = private.current_auth_uid())
  WITH CHECK (seller_id = private.current_auth_uid());

-- inventory: seller can view & update inventory for own products
ALTER TABLE IF EXISTS public.inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS inventory_select_own ON public.inventory;
CREATE POLICY inventory_select_own ON public.inventory
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.products p WHERE p.id = public.inventory.product_id AND p.seller_id = private.current_auth_uid())
  );

DROP POLICY IF EXISTS inventory_update_own ON public.inventory;
CREATE POLICY inventory_update_own ON public.inventory
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.products p WHERE p.id = public.inventory.product_id AND p.seller_id = private.current_auth_uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.products p WHERE p.id = public.inventory.product_id AND p.seller_id = private.current_auth_uid())
  );

-- stock_logs: seller can view logs for own products
ALTER TABLE IF EXISTS public.stock_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS stock_logs_select_own ON public.stock_logs;
CREATE POLICY stock_logs_select_own ON public.stock_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.products p WHERE p.id = public.stock_logs.product_id AND p.seller_id = private.current_auth_uid())
  );

DROP POLICY IF EXISTS stock_logs_insert ON public.stock_logs;
CREATE POLICY stock_logs_insert ON public.stock_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.products p WHERE p.id = public.stock_logs.product_id AND p.seller_id = private.current_auth_uid())
  );

-- user_roles: users can view their own roles, admins can manage all
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_roles_select_own ON public.user_roles;
CREATE POLICY user_roles_select_own ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = private.current_auth_uid() OR private.user_has_role('admin'));

DROP POLICY IF EXISTS user_roles_admin_manage ON public.user_roles;
CREATE POLICY user_roles_admin_manage ON public.user_roles
  FOR ALL
  TO authenticated
  USING (private.user_has_role('admin'))
  WITH CHECK (private.user_has_role('admin'));

-- ---------------------------
-- 4. Indexes recommandés (perf)
-- ---------------------------
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON public.inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_logs_product_id ON public.stock_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);