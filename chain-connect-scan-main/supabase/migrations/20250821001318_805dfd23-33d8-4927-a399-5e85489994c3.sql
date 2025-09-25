-- Créer un utilisateur PDG de test
-- Note: L'utilisateur devra d'abord s'inscrire avec cet email, puis ce script lui donnera les droits PDG

-- Fonction pour promouvoir un utilisateur en PDG
CREATE OR REPLACE FUNCTION public.make_user_pdg(user_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  target_user_id UUID;
BEGIN
  -- Trouver l'utilisateur par email
  SELECT user_id INTO target_user_id 
  FROM public.profiles 
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur avec email % non trouvé', user_email;
  END IF;
  
  -- Ajouter le rôle PDG
  INSERT INTO public.admin_roles (user_id, role_type, permissions)
  VALUES (target_user_id, 'pdg', '{"full_access": true}')
  ON CONFLICT (user_id, role_type) DO NOTHING;
  
  -- Mettre à jour le profil comme admin
  UPDATE public.profiles 
  SET role = 'admin', is_verified = true
  WHERE user_id = target_user_id;
  
END;
$function$