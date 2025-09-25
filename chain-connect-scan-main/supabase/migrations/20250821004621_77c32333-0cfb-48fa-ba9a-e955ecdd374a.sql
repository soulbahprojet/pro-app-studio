-- Créer quelques données de test pour les employés
-- D'abord, créer quelques profils de test pour les vendeurs et employés
INSERT INTO profiles (user_id, email, full_name, role, readable_id, country) 
VALUES 
  (gen_random_uuid(), 'vendeur1@test.com', 'Ahmed Diallo', 'seller', 'VDR-0001', 'Guinea'),
  (gen_random_uuid(), 'employe1@test.com', 'Mamadou Bah', 'client', 'CLT-0001', 'Guinea'),
  (gen_random_uuid(), 'employe2@test.com', 'Aissatou Diallo', 'client', 'CLT-0002', 'Guinea'),
  (gen_random_uuid(), 'manager1@test.com', 'Ibrahim Conde', 'client', 'CLT-0004', 'Guinea');

-- Maintenant créer les relations employés
INSERT INTO employees (seller_id, employee_id, role, is_active, hired_at, permissions)
SELECT 
  (SELECT user_id FROM profiles WHERE email = 'vendeur1@test.com'),
  (SELECT user_id FROM profiles WHERE email = 'employe1@test.com'),
  'assistant',
  true,
  '2024-01-15',
  ARRAY['read', 'write'];

INSERT INTO employees (seller_id, employee_id, role, is_active, hired_at, permissions)
SELECT 
  (SELECT user_id FROM profiles WHERE email = 'vendeur1@test.com'),
  (SELECT user_id FROM profiles WHERE email = 'employe2@test.com'),
  'staff',
  true,
  '2024-03-20',
  ARRAY['read'];

INSERT INTO employees (seller_id, employee_id, role, is_active, hired_at, permissions)
SELECT 
  (SELECT user_id FROM profiles WHERE email = 'vendeur1@test.com'),
  (SELECT user_id FROM profiles WHERE email = 'manager1@test.com'),
  'manager',
  true,
  '2023-12-01',
  ARRAY['read', 'write', 'admin'];