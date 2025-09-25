-- Correction avec les bonnes colonnes des tables syndicat

-- 1. Table member_votes - votes des membres
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

-- 2. Table syndicat_contributions - contributions financières (pas de syndicat_id direct)
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

-- Union leaders can view contributions of their members
CREATE POLICY "Union leaders can view member contributions" 
ON public.syndicat_contributions 
FOR SELECT 
TO authenticated 
USING (member_id IN (
    SELECT sm.id FROM public.syndicat_members sm 
    JOIN public.unions u ON sm.union_id = u.id 
    WHERE u.leader_id = auth.uid()
));

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

CREATE POLICY "Organizers can manage meetings" 
ON public.syndicat_meetings 
FOR ALL 
TO authenticated 
USING (organizer_id = auth.uid())
WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "Syndicat leaders can manage all meetings" 
ON public.syndicat_meetings 
FOR ALL 
TO authenticated 
USING (syndicat_id IN (SELECT id FROM public.unions WHERE leader_id = auth.uid()));

-- 5. Table syndicat_votes - votes du syndicat (liés aux meetings)
CREATE POLICY "Meeting participants can view votes" 
ON public.syndicat_votes 
FOR SELECT 
TO authenticated 
USING (meeting_id IN (
    SELECT m.id FROM public.syndicat_meetings m
    JOIN public.syndicat_members sm ON m.syndicat_id = sm.union_id
    WHERE sm.user_id = auth.uid() AND sm.is_active = true
));

CREATE POLICY "Meeting organizers can manage votes" 
ON public.syndicat_votes 
FOR ALL 
TO authenticated 
USING (meeting_id IN (
    SELECT id FROM public.syndicat_meetings WHERE organizer_id = auth.uid()
))
WITH CHECK (meeting_id IN (
    SELECT id FROM public.syndicat_meetings WHERE organizer_id = auth.uid()
));