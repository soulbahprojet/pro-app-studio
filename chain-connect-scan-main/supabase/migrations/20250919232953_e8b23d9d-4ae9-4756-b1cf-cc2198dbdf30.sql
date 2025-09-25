-- Donner le rôle PDG à l'utilisateur admin actuel
INSERT INTO admin_roles (user_id, role_type, permissions)
VALUES ('53890a50-1837-4e23-95fe-2e26610dc1f6', 'pdg', '{"full_access": true}')
ON CONFLICT (user_id, role_type) DO NOTHING;