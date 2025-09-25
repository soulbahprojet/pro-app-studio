-- Créer un utilisateur PDG de test
-- Note: Ceci simule un utilisateur PDG pour les tests

-- Créer un profil PDG de test (simule un utilisateur auth)
INSERT INTO public.profiles (
  user_id,
  email,
  full_name,
  role,
  phone,
  country,
  readable_id,
  is_verified
) VALUES (
  gen_random_uuid(),
  'pdg@224solutions.com',
  'PDG 224Solutions',
  'admin',
  '+224123456789',
  'GN',
  generate_new_client_id(),
  true
) ON CONFLICT (email) DO NOTHING;

-- Ajouter les droits PDG
INSERT INTO public.admin_roles (user_id, role_type, permissions)
SELECT 
  p.user_id,
  'pdg',
  '{"full_access": true, "created_for_testing": true}'
FROM public.profiles p 
WHERE p.email = 'pdg@224solutions.com'
ON CONFLICT (user_id, role_type) DO NOTHING;