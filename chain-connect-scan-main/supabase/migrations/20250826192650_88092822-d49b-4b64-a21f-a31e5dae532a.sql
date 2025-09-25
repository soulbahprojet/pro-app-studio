-- CORRECTION URGENTE: Élimination complète de l'accès anonyme
-- Toutes les politiques doivent vérifier auth.uid() IS NOT NULL

-- Fonction utilitaire pour vérifier l'authentification réelle
CREATE OR REPLACE FUNCTION public.is_authenticated() 
RETURNS BOOLEAN 
LANGUAGE SQL 
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL;
$$;

-- Appliquer une politique globale pour toutes les tables critiques
-- Cette approche va FORCER la vérification d'authentification réelle

-- 1. Wallet - CRITIQUE
DROP POLICY IF EXISTS "Users can only access their own wallet" ON public.wallets;
DROP POLICY IF EXISTS "Users can update their own wallet" ON public.wallets;
DROP POLICY IF EXISTS "Users can view their own wallet" ON public.wallets;
CREATE POLICY "Verified users only access their wallet" 
ON public.wallets 
FOR ALL 
TO authenticated 
USING (is_authenticated() AND user_id = auth.uid())
WITH CHECK (is_authenticated() AND user_id = auth.uid());

-- 2. Transactions - CRITIQUE  
DROP POLICY IF EXISTS "Users can only view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
CREATE POLICY "Verified users view own transactions" 
ON public.transactions 
FOR SELECT 
TO authenticated 
USING (is_authenticated() AND wallet_id IN (SELECT id FROM public.wallets WHERE user_id = auth.uid()));

-- 3. KYC Documents - CRITIQUE
DROP POLICY IF EXISTS "Users can only access their own KYC documents" ON public.kyc_documents;
CREATE POLICY "Verified users access own KYC" 
ON public.kyc_documents 
FOR ALL 
TO authenticated 
USING (is_authenticated() AND user_id = auth.uid())
WITH CHECK (is_authenticated() AND user_id = auth.uid());

-- 4. Virtual Cards - CRITIQUE
DROP POLICY IF EXISTS "Users can only access their own cards" ON public.virtual_cards;
CREATE POLICY "Verified users access own cards" 
ON public.virtual_cards 
FOR ALL 
TO authenticated 
USING (is_authenticated() AND (user_id = auth.uid() OR manager_id = auth.uid()))
WITH CHECK (is_authenticated() AND (user_id = auth.uid() OR manager_id = auth.uid()));

-- 5. Messages - CRITIQUE
DROP POLICY IF EXISTS "Users can only view messages in their conversations" ON public.messages;
CREATE POLICY "Verified users view own messages" 
ON public.messages 
FOR ALL 
TO authenticated 
USING (is_authenticated() AND conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE client_id = auth.uid() OR seller_id = auth.uid() OR support_id = auth.uid()
))
WITH CHECK (is_authenticated() AND sender_id = auth.uid());

-- 6. Profiles - Accès restreint aux propriétaires seulement
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.profiles;
CREATE POLICY "Verified users manage own profile" 
ON public.profiles 
FOR ALL 
TO authenticated 
USING (is_authenticated() AND user_id = auth.uid())
WITH CHECK (is_authenticated() AND user_id = auth.uid());

-- 7. Orders - CRITIQUE pour e-commerce
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Sellers and couriers can update orders" ON public.orders;
CREATE POLICY "Verified users access related orders" 
ON public.orders 
FOR ALL 
TO authenticated 
USING (is_authenticated() AND (customer_id = auth.uid() OR seller_id = auth.uid() OR courier_id = auth.uid()))
WITH CHECK (is_authenticated() AND (customer_id = auth.uid() OR seller_id = auth.uid() OR courier_id = auth.uid()));