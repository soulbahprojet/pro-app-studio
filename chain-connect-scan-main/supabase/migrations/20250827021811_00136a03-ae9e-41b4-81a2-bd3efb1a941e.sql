-- Fix security issues: Function search_path and RLS policies for anonymous access

-- 1. Fix function search_path for security functions
CREATE OR REPLACE FUNCTION public.is_pdg_user()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_roles
    WHERE user_id = auth.uid()
      AND role_type = 'pdg'
  )
$function$;

CREATE OR REPLACE FUNCTION public.is_authenticated()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT auth.uid() IS NOT NULL;
$function$;

CREATE OR REPLACE FUNCTION public.require_authenticated_user()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  -- Vérifier que l'utilisateur est authentifié ET a un profil valide
  SELECT auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = auth.uid()
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_subscription_system_enabled()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (setting_value->>'enabled')::boolean, 
    true
  ) FROM public.system_settings 
  WHERE setting_key = 'subscription_system_enabled' 
  LIMIT 1;
$function$;

-- 2. Update RLS policies to ensure only authenticated users have access

-- Drop and recreate admin_roles policies with stricter authentication
DROP POLICY IF EXISTS "Authenticated users can insert their own admin role" ON public.admin_roles;
DROP POLICY IF EXISTS "Authenticated users can view their own admin roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Only PDG users can manage admin roles" ON public.admin_roles;

CREATE POLICY "Authenticated users can insert their own admin role" 
ON public.admin_roles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Authenticated users can view their own admin roles" 
ON public.admin_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Only PDG users can manage admin roles" 
ON public.admin_roles 
FOR ALL 
TO authenticated
USING (is_pdg_user())
WITH CHECK (is_pdg_user());

-- Fix affiliate_commissions policies
DROP POLICY IF EXISTS "Allow PDG to manage commissions" ON public.affiliate_commissions;
DROP POLICY IF EXISTS "Authenticated users can view their commissions" ON public.affiliate_commissions;

CREATE POLICY "Allow PDG to manage commissions" 
ON public.affiliate_commissions 
FOR ALL 
TO authenticated
USING (is_pdg_user())
WITH CHECK (is_pdg_user());

CREATE POLICY "Authenticated users can view their commissions" 
ON public.affiliate_commissions 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL AND (auth.uid() = affiliate_id OR auth.uid() = referral_id));

-- Fix affiliates policies
DROP POLICY IF EXISTS "Authenticated affiliates can view their earnings" ON public.affiliates;
DROP POLICY IF EXISTS "Authenticated sellers can view their affiliates" ON public.affiliates;
DROP POLICY IF EXISTS "System can manage affiliates" ON public.affiliates;

CREATE POLICY "Authenticated affiliates can view their earnings" 
ON public.affiliates 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = affiliate_id);

CREATE POLICY "Authenticated sellers can view their affiliates" 
ON public.affiliates 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = seller_id);

CREATE POLICY "PDG can manage affiliates" 
ON public.affiliates 
FOR ALL 
TO authenticated
USING (is_pdg_user())
WITH CHECK (is_pdg_user());

-- Fix badges policies
DROP POLICY IF EXISTS "Authenticated users can view their badges" ON public.badges;
DROP POLICY IF EXISTS "System can manage badges" ON public.badges;

CREATE POLICY "Authenticated users can view their badges" 
ON public.badges 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = courier_id);

CREATE POLICY "PDG can manage badges" 
ON public.badges 
FOR ALL 
TO authenticated
USING (is_pdg_user())
WITH CHECK (is_pdg_user());

-- Fix card_daily_usage policies
DROP POLICY IF EXISTS "Authenticated users can manage their usage" ON public.card_daily_usage;

CREATE POLICY "Authenticated users can manage their usage" 
ON public.card_daily_usage 
FOR ALL 
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Fix card_notifications policies
DROP POLICY IF EXISTS "Authenticated users can manage their card notifications" ON public.card_notifications;
DROP POLICY IF EXISTS "Authenticated users can view their card notifications" ON public.card_notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.card_notifications;

CREATE POLICY "Authenticated users can update their card notifications" 
ON public.card_notifications 
FOR UPDATE 
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Authenticated users can view their card notifications" 
ON public.card_notifications 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Service role can create notifications" 
ON public.card_notifications 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Fix card_transactions policies
DROP POLICY IF EXISTS "Users can view their card transactions" ON public.card_transactions;
DROP POLICY IF EXISTS "System can insert transactions" ON public.card_transactions;

CREATE POLICY "Authenticated users can view their card transactions" 
ON public.card_transactions 
FOR SELECT 
TO authenticated
USING (card_id IN (
  SELECT virtual_cards.id
  FROM virtual_cards
  WHERE (virtual_cards.user_id = auth.uid() OR virtual_cards.manager_id = auth.uid())
));

CREATE POLICY "Service role can insert transactions" 
ON public.card_transactions 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Fix carrier_options policies
DROP POLICY IF EXISTS "Authenticated users can view active carriers" ON public.carrier_options;
DROP POLICY IF EXISTS "Only admins can modify carriers" ON public.carrier_options;

CREATE POLICY "Authenticated users can view active carriers" 
ON public.carrier_options 
FOR SELECT 
TO authenticated
USING (is_active = true);

CREATE POLICY "Only PDG can modify carriers" 
ON public.carrier_options 
FOR ALL 
TO authenticated
USING (is_pdg_user())
WITH CHECK (is_pdg_user());

-- Fix carrier_performance policies  
DROP POLICY IF EXISTS "Authenticated users can view carrier performance" ON public.carrier_performance;
DROP POLICY IF EXISTS "Only admins can modify carrier performance" ON public.carrier_performance;

CREATE POLICY "Authenticated users can view carrier performance" 
ON public.carrier_performance 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Only PDG can modify carrier performance" 
ON public.carrier_performance 
FOR ALL 
TO authenticated
USING (is_pdg_user())
WITH CHECK (is_pdg_user());