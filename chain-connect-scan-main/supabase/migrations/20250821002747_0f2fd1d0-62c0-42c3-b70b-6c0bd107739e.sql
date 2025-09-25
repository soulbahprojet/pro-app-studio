-- Donner les droits PDG à l'utilisateur actuel
INSERT INTO public.admin_roles (user_id, role_type, permissions)
VALUES (
  'aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c',
  'pdg',
  '{"full_access": true, "created_by_system": true}'
) ON CONFLICT (user_id, role_type) DO NOTHING;