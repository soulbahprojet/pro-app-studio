-- Créer des données de test simples pour les employés
-- Utilisation de l'utilisateur existant comme employé de test

-- Créer une relation d'emploi où votre utilisateur actuel est employé par lui-même (pour les tests)
INSERT INTO employees (seller_id, employee_id, role, is_active, hired_at, permissions)
VALUES 
  ('aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c', 'aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c', 'manager', true, CURRENT_DATE - INTERVAL '90 days', ARRAY['read', 'write', 'manage']);

-- Créer quelques boutiques pour tester
INSERT INTO seller_shops (seller_id, shop_name, description, is_active, subscription_plan)
VALUES 
  ('aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c', 'Boutique Test 224Solutions', 'Boutique de démonstration pour tester les fonctionnalités', true, 'premium');

-- Créer quelques conversations de test
INSERT INTO conversations (client_id, seller_id, subject, status)
VALUES 
  ('aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c', 'aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c', 'Question sur un produit', 'active'),
  ('aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c', NULL, 'Demande de support technique', 'active');

-- Créer quelques messages de test
INSERT INTO messages (conversation_id, sender_id, message)
SELECT c.id, 'aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c', 'Message de test pour la démonstration'
FROM conversations c
WHERE c.client_id = 'aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c'
LIMIT 2;