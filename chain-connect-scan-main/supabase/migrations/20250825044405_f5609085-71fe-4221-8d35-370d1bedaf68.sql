-- Créer une fonction pour vérifier si un utilisateur est PDG
CREATE OR REPLACE FUNCTION public.is_pdg_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_roles
    WHERE user_id = auth.uid()
      AND role_type = 'pdg'
  )
$$;

-- Ajouter l'utilisateur actuel comme PDG
INSERT INTO public.admin_roles (user_id, role_type, permissions)
VALUES ('79b793c1-3eb4-40da-ba5c-12a4a0ab3180', 'pdg', '{"system_settings": true, "user_management": true, "subscription_control": true}'::jsonb)
ON CONFLICT (user_id, role_type) DO NOTHING;