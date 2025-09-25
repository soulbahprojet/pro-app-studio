-- Créer un employé de test en utilisant votre utilisateur existant comme vendeur
-- et créer des relations d'employés fictives
INSERT INTO employees (
  seller_id, 
  employee_id, 
  role, 
  is_active, 
  hired_at, 
  permissions
) VALUES (
  'aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c', -- Votre user_id
  'aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c', -- Même user_id pour exemple
  'assistant',
  true,
  '2024-01-15',
  ARRAY['read', 'write']
), (
  'aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c', -- Votre user_id comme vendeur
  'aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c', -- Même user_id pour exemple
  'manager',
  true,
  '2023-12-01',
  ARRAY['read', 'write', 'admin']
);