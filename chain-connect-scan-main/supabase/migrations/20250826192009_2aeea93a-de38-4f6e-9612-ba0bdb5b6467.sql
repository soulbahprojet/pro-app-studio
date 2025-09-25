-- Correction finale : Éliminer TOUS les accès anonymes (Partie 3)
-- Corriger toutes les politiques qui permettent l'accès aux utilisateurs non authentifiés

-- 1. Corriger les politiques qui utilisent auth.uid() sans vérifier l'authentification
-- Remplacer toutes les politiques pour s'assurer qu'elles requièrent l'authentification

-- Correction des politiques principales qui permettent l'accès anonyme
ALTER TABLE public.admin_roles FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own admin roles" ON public.admin_roles;
CREATE POLICY "Authenticated users can view their own admin roles" 
ON public.admin_roles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

ALTER TABLE public.affiliate_commissions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their commissions" ON public.affiliate_commissions;
CREATE POLICY "Authenticated users can view their commissions" 
ON public.affiliate_commissions 
FOR SELECT 
TO authenticated 
USING ((auth.uid() = affiliate_id) OR (auth.uid() = referral_id));

DROP POLICY IF EXISTS "Allow PDG to manage commissions" ON public.affiliate_commissions;
CREATE POLICY "PDG can manage commissions" 
ON public.affiliate_commissions 
FOR ALL 
TO authenticated 
USING (is_pdg_user())
WITH CHECK (is_pdg_user());

ALTER TABLE public.affiliates FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Affiliates can view their earnings" ON public.affiliates;
DROP POLICY IF EXISTS "Sellers can view their affiliates" ON public.affiliates;
CREATE POLICY "Authenticated affiliates can view their earnings" 
ON public.affiliates 
FOR SELECT 
TO authenticated 
USING (auth.uid() = affiliate_id);

CREATE POLICY "Authenticated sellers can view their affiliates" 
ON public.affiliates 
FOR SELECT 
TO authenticated 
USING (auth.uid() = seller_id);

ALTER TABLE public.badges FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their badges" ON public.badges;
CREATE POLICY "Authenticated users can view their badges" 
ON public.badges 
FOR SELECT 
TO authenticated 
USING (auth.uid() = courier_id);

ALTER TABLE public.card_daily_usage FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update their usage" ON public.card_daily_usage;
DROP POLICY IF EXISTS "Users can view their usage" ON public.card_daily_usage;
CREATE POLICY "Authenticated users can manage their usage" 
ON public.card_daily_usage 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.card_notifications FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update their notifications" ON public.card_notifications;
DROP POLICY IF EXISTS "Users can view their notifications" ON public.card_notifications;
CREATE POLICY "Authenticated users can manage their notifications" 
ON public.card_notifications 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.card_transactions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their card transactions" ON public.card_transactions;
CREATE POLICY "Authenticated users can view their card transactions" 
ON public.card_transactions 
FOR SELECT 
TO authenticated 
USING (card_id IN ( SELECT virtual_cards.id
   FROM virtual_cards
  WHERE ((virtual_cards.user_id = auth.uid()) OR (virtual_cards.manager_id = auth.uid()))));

-- Continuer avec les autres tables critiques...
ALTER TABLE public.conversations FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Authenticated users can view their conversations" 
ON public.conversations 
FOR SELECT 
TO authenticated 
USING ((auth.uid() = client_id) OR (auth.uid() = seller_id) OR (auth.uid() = support_id));

CREATE POLICY "Authenticated users can create conversations" 
ON public.conversations 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = client_id);