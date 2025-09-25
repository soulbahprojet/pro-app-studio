-- Correction des accès anonymes - Approche progressive (Partie 3A)
-- Correction sans deadlock en traitant les politiques une par une

-- 1. Corriger les politiques les plus critiques d'abord
DROP POLICY IF EXISTS "Users can view their own admin roles" ON public.admin_roles;
CREATE POLICY "Authenticated users can view their own admin roles" 
ON public.admin_roles 
FOR SELECT 
TO authenticated 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their commissions" ON public.affiliate_commissions;
CREATE POLICY "Authenticated users can view their commissions" 
ON public.affiliate_commissions 
FOR SELECT 
TO authenticated 
USING (auth.uid() IS NOT NULL AND ((auth.uid() = affiliate_id) OR (auth.uid() = referral_id)));

DROP POLICY IF EXISTS "Affiliates can view their earnings" ON public.affiliates;
CREATE POLICY "Authenticated affiliates can view their earnings" 
ON public.affiliates 
FOR SELECT 
TO authenticated 
USING (auth.uid() IS NOT NULL AND auth.uid() = affiliate_id);

DROP POLICY IF EXISTS "Sellers can view their affiliates" ON public.affiliates;
CREATE POLICY "Authenticated sellers can view their affiliates" 
ON public.affiliates 
FOR SELECT 
TO authenticated 
USING (auth.uid() IS NOT NULL AND auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can view their badges" ON public.badges;
CREATE POLICY "Authenticated users can view their badges" 
ON public.badges 
FOR SELECT 
TO authenticated 
USING (auth.uid() IS NOT NULL AND auth.uid() = courier_id);

-- 2. Corriger les politiques de cartes virtuelles
DROP POLICY IF EXISTS "Users can update their usage" ON public.card_daily_usage;
DROP POLICY IF EXISTS "Users can view their usage" ON public.card_daily_usage;
CREATE POLICY "Authenticated users can manage their usage" 
ON public.card_daily_usage 
FOR ALL 
TO authenticated 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their notifications" ON public.card_notifications;
DROP POLICY IF EXISTS "Users can view their notifications" ON public.card_notifications;
CREATE POLICY "Authenticated users can manage their card notifications" 
ON public.card_notifications 
FOR UPDATE 
TO authenticated 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Authenticated users can view their card notifications" 
ON public.card_notifications 
FOR SELECT 
TO authenticated 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);