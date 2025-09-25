-- Créer quelques données de test pour les employés
-- D'abord, créer quelques profils de test pour les vendeurs et employés
INSERT INTO profiles (user_id, email, full_name, role, readable_id, country) 
VALUES 
  (gen_random_uuid(), 'vendeur1@test.com', 'Ahmed Diallo', 'seller', 'VDR-0001', 'Guinea'),
  (gen_random_uuid(), 'vendeur2@test.com', 'Fatima Camara', 'seller', 'VDR-0002', 'Guinea'),
  (gen_random_uuid(), 'employe1@test.com', 'Mamadou Bah', 'client', 'CLT-0001', 'Guinea'),
  (gen_random_uuid(), 'employe2@test.com', 'Aissatou Diallo', 'client', 'CLT-0002', 'Guinea'),
  (gen_random_uuid(), 'employe3@test.com', 'Oumar Sylla', 'client', 'CLT-0003', 'Guinea'),
  (gen_random_uuid(), 'manager1@test.com', 'Ibrahim Conde', 'client', 'CLT-0004', 'Guinea')
ON CONFLICT (email) DO NOTHING;

-- Maintenant créer les relations employés avec des IDs existants
WITH seller_ids AS (
  SELECT user_id, email FROM profiles WHERE email IN ('vendeur1@test.com', 'vendeur2@test.com')
),
employee_ids AS (
  SELECT user_id, email FROM profiles WHERE email IN ('employe1@test.com', 'employe2@test.com', 'employe3@test.com', 'manager1@test.com')
)
INSERT INTO employees (seller_id, employee_id, role, is_active, hired_at, permissions)
SELECT 
  s.user_id,
  e.user_id,
  CASE 
    WHEN e.email = 'manager1@test.com' THEN 'manager'
    WHEN e.email = 'employe1@test.com' THEN 'assistant' 
    ELSE 'staff'
  END,
  true,
  CURRENT_DATE - INTERVAL '30 days' * (random() * 12),
  ARRAY['read', 'write']
FROM seller_ids s
CROSS JOIN employee_ids e
WHERE s.email = 'vendeur1@test.com' AND e.email IN ('employe1@test.com', 'manager1@test.com')
UNION ALL
SELECT 
  s.user_id,
  e.user_id,
  'staff',
  true,
  CURRENT_DATE - INTERVAL '15 days' * (random() * 6),
  ARRAY['read']
FROM seller_ids s
CROSS JOIN employee_ids e
WHERE s.email = 'vendeur2@test.com' AND e.email IN ('employe2@test.com', 'employe3@test.com');