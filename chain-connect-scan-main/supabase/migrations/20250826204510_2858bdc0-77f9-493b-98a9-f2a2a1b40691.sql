-- CORRECTION CRITIQUE DE SÉCURITÉ : Faille d'accès entre utilisateurs
-- Cette migration corrige la faille permettant à un utilisateur d'accéder aux données d'autres utilisateurs

-- Vérifier et corriger seulement les politiques problématiques existantes

-- 1. Corriger profiles - permettre seulement l'accès à son propre profil
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can only view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can only update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can only insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- 2. Corriger wallets - accès strictement personnel
DROP POLICY IF EXISTS "Authenticated users can manage their wallets" ON public.wallets;

CREATE POLICY "Users can only access their own wallet" ON public.wallets
FOR ALL USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- 3. Corriger transactions - via wallet personnel uniquement
DROP POLICY IF EXISTS "Authenticated users can view their transactions" ON public.transactions;

CREATE POLICY "Users can only view their own transactions" ON public.transactions
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  wallet_id IN (SELECT id FROM public.wallets WHERE user_id = auth.uid())
);

-- 4. Assurer que les tables critiques ont RLS activé
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;