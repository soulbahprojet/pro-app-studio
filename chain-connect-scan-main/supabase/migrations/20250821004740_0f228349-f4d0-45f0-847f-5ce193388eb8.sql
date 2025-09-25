-- Créer des données de test simples pour les employés
-- Utilisation de l'utilisateur existant comme employé de test

-- Créer une relation d'emploi où votre utilisateur actuel est employé par lui-même (pour les tests)
INSERT INTO employees (seller_id, employee_id, role, is_active, hired_at, permissions)
VALUES 
  ('aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c', 'aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c', 'manager', true, CURRENT_DATE - INTERVAL '90 days', ARRAY['read', 'write', 'manage'])
ON CONFLICT (seller_id, employee_id) DO NOTHING;

-- Créer quelques boutiques pour tester
INSERT INTO seller_shops (seller_id, shop_name, description, is_active, subscription_plan)
VALUES 
  ('aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c', 'Boutique Test 224Solutions', 'Boutique de démonstration pour tester les fonctionnalités', true, 'premium')
ON CONFLICT (seller_id) DO UPDATE SET 
  shop_name = EXCLUDED.shop_name,
  description = EXCLUDED.description,
  subscription_plan = EXCLUDED.subscription_plan;

-- Créer quelques conversations de test
INSERT INTO conversations (client_id, seller_id, subject, status)
VALUES 
  ('aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c', 'aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c', 'Question sur un produit', 'active'),
  ('aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c', NULL, 'Demande de support technique', 'active')
ON CONFLICT DO NOTHING;