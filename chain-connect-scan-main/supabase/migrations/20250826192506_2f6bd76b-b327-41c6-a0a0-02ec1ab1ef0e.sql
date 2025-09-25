-- Correction des derniers problèmes de sécurité critiques
-- Ajouter les politiques manquantes pour les tables avec RLS mais sans politiques

-- 1. Table member_votes - votes des membres du syndicat
CREATE POLICY "Members can view their own votes" 
ON public.member_votes 
FOR SELECT 
TO authenticated 
USING (member_id IN (SELECT id FROM public.syndicat_members WHERE user_id = auth.uid()));

CREATE POLICY "Members can create their own votes" 
ON public.member_votes 
FOR INSERT 
TO authenticated 
WITH CHECK (member_id IN (SELECT id FROM public.syndicat_members WHERE user_id = auth.uid()));

-- 2. Table syndicat_contributions - contributions financières
CREATE POLICY "Members can view their own contributions" 
ON public.syndicat_contributions 
FOR SELECT 
TO authenticated 
USING (member_id IN (SELECT id FROM public.syndicat_members WHERE user_id = auth.uid()));

CREATE POLICY "Members can create their own contributions" 
ON public.syndicat_contributions 
FOR INSERT 
TO authenticated 
WITH CHECK (member_id IN (SELECT id FROM public.syndicat_members WHERE user_id = auth.uid()));

CREATE POLICY "Syndicat admins can manage contributions" 
ON public.syndicat_contributions 
FOR ALL 
TO authenticated 
USING (syndicat_id IN (SELECT id FROM public.unions WHERE leader_id = auth.uid()));

-- 3. Table syndicat_finances - finances du syndicat
CREATE POLICY "Syndicat leaders can manage finances" 
ON public.syndicat_finances 
FOR ALL 
TO authenticated 
USING (syndicat_id IN (SELECT id FROM public.unions WHERE leader_id = auth.uid()))
WITH CHECK (syndicat_id IN (SELECT id FROM public.unions WHERE leader_id = auth.uid()));

CREATE POLICY "Members can view finances of their syndicat" 
ON public.syndicat_finances 
FOR SELECT 
TO authenticated 
USING (syndicat_id IN (
    SELECT sm.union_id FROM public.syndicat_members sm 
    WHERE sm.user_id = auth.uid() AND sm.is_active = true
));

-- 4. Table syndicat_meetings - réunions du syndicat
CREATE POLICY "Members can view meetings of their syndicat" 
ON public.syndicat_meetings 
FOR SELECT 
TO authenticated 
USING (syndicat_id IN (
    SELECT sm.union_id FROM public.syndicat_members sm 
    WHERE sm.user_id = auth.uid() AND sm.is_active = true
));

CREATE POLICY "Syndicat leaders can manage meetings" 
ON public.syndicat_meetings 
FOR ALL 
TO authenticated 
USING (syndicat_id IN (SELECT id FROM public.unions WHERE leader_id = auth.uid()))
WITH CHECK (syndicat_id IN (SELECT id FROM public.unions WHERE leader_id = auth.uid()));

-- 5. Table syndicat_votes - votes du syndicat
CREATE POLICY "Members can view votes of their syndicat" 
ON public.syndicat_votes 
FOR SELECT 
TO authenticated 
USING (syndicat_id IN (
    SELECT sm.union_id FROM public.syndicat_members sm 
    WHERE sm.user_id = auth.uid() AND sm.is_active = true
));

CREATE POLICY "Syndicat leaders can manage votes" 
ON public.syndicat_votes 
FOR ALL 
TO authenticated 
USING (syndicat_id IN (SELECT id FROM public.unions WHERE leader_id = auth.uid()))
WITH CHECK (syndicat_id IN (SELECT id FROM public.unions WHERE leader_id = auth.uid()));

-- 6. Sécuriser le search_path pour quelques fonctions critiques
ALTER FUNCTION public.handle_new_user_signup() SET search_path = public, extensions;
ALTER FUNCTION public.process_wallet_transfer(uuid, uuid, numeric, text, numeric, text, text, text) SET search_path = public;
ALTER FUNCTION public.process_escrow_payment(uuid, uuid, uuid, numeric, numeric, text) SET search_path = public;
ALTER FUNCTION public.release_escrow_payment(uuid) SET search_path = public;
ALTER FUNCTION public.confirm_delivery_escrow(uuid) SET search_path = public;
ALTER FUNCTION public.handle_escrow_dispute(uuid, text, text) SET search_path = public;