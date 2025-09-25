-- CORRECTION CRITIQUE : Sécuriser toutes les politiques RLS pour empêcher l'accès entre utilisateurs
-- Cette migration corrige la faille permettant à un utilisateur d'accéder aux données d'autres utilisateurs

-- 1. Corriger les politiques admin_roles pour exiger une authentification stricte
DROP POLICY IF EXISTS "Authenticated users can view their own admin roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Only PDG users can manage admin roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Authenticated users can insert their own admin role" ON public.admin_roles;

CREATE POLICY "Users can only view their own admin roles" ON public.admin_roles
FOR SELECT USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can only insert their own admin roles" ON public.admin_roles  
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Only authenticated PDG users can manage all admin roles" ON public.admin_roles
FOR ALL USING (auth.uid() IS NOT NULL AND is_pdg_user());

-- 2. Corriger les politiques profiles pour une sécurité maximale
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can only view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can only update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can only insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- 3. Corriger les politiques wallets
DROP POLICY IF EXISTS "Authenticated users can manage their wallets" ON public.wallets;

CREATE POLICY "Users can only access their own wallet" ON public.wallets
FOR ALL USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- 4. Corriger les politiques transactions
DROP POLICY IF EXISTS "Authenticated users can view their transactions" ON public.transactions;

CREATE POLICY "Users can only view their own transactions" ON public.transactions
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  wallet_id IN (SELECT id FROM public.wallets WHERE user_id = auth.uid())
);

-- 5. Corriger les politiques orders
DROP POLICY IF EXISTS "Authenticated users can manage their orders" ON public.orders;
DROP POLICY IF EXISTS "Customers can view their orders" ON public.orders;
DROP POLICY IF EXISTS "Sellers can view their orders" ON public.orders;

CREATE POLICY "Users can only view orders they are involved in" ON public.orders
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    customer_id = auth.uid() OR 
    seller_id = auth.uid() OR 
    courier_id = auth.uid()
  )
);

CREATE POLICY "Customers can create orders" ON public.orders
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND customer_id = auth.uid());

CREATE POLICY "Users can update orders they are involved in" ON public.orders
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND (
    customer_id = auth.uid() OR 
    seller_id = auth.uid() OR 
    courier_id = auth.uid()
  )
);

-- 6. Corriger les politiques products
DROP POLICY IF EXISTS "Authenticated users can view active products" ON public.products;
DROP POLICY IF EXISTS "Sellers can manage their products" ON public.products;

CREATE POLICY "Anyone can view active products" ON public.products
FOR SELECT USING (is_active = true);

CREATE POLICY "Sellers can only manage their own products" ON public.products
FOR ALL USING (auth.uid() IS NOT NULL AND seller_id = auth.uid())
WITH CHECK (auth.uid() IS NOT NULL AND seller_id = auth.uid());

-- 7. Corriger les politiques digital_access
DROP POLICY IF EXISTS "Users can view their own digital access" ON public.digital_access;

CREATE POLICY "Users can only view their own digital access" ON public.digital_access
FOR SELECT USING (auth.uid() IS NOT NULL AND customer_id = auth.uid());

-- 8. Corriger les politiques favorites 
DROP POLICY IF EXISTS "Users can manage their favorites" ON public.favorites;

CREATE POLICY "Users can only manage their own favorites" ON public.favorites
FOR ALL USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- 9. Corriger les politiques virtual_cards
DROP POLICY IF EXISTS "Authenticated users can manage their cards" ON public.virtual_cards;

CREATE POLICY "Users can only manage their own virtual cards" ON public.virtual_cards
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR 
    manager_id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR 
    manager_id = auth.uid()
  )
);

-- 10. Assurer que toutes les tables critiques ont RLS activé
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_cards ENABLE ROW LEVEL SECURITY;