-- Corriger la récursion infinie dans les politiques admin_roles
-- Le problème : la politique fait référence à la même table qu'elle protège

-- Supprimer les anciennes politiques récursives
DROP POLICY IF EXISTS "PDG can manage all admin roles" ON public.admin_roles;
DROP POLICY IF EXISTS "PDG can manage all subscriptions" ON public.pdg_subscriptions;
DROP POLICY IF EXISTS "PDG can manage all commissions" ON public.affiliate_commissions;

-- Créer une fonction sécurisée pour vérifier le rôle PDG
CREATE OR REPLACE FUNCTION public.is_pdg_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_roles 
    WHERE user_id = auth.uid() 
    AND role_type = 'pdg'
  );
$$;

-- Nouvelles politiques non-récursives pour admin_roles
CREATE POLICY "Allow PDG to manage admin roles" ON public.admin_roles
FOR ALL USING (public.is_pdg_user());

-- Nouvelles politiques pour pdg_subscriptions
CREATE POLICY "Allow PDG to manage subscriptions" ON public.pdg_subscriptions
FOR ALL USING (public.is_pdg_user());

-- Nouvelles politiques pour affiliate_commissions
CREATE POLICY "Allow PDG to manage commissions" ON public.affiliate_commissions
FOR ALL USING (public.is_pdg_user());