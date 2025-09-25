-- Créer des données de test simples pour démontrer le système
-- Insérer un employé de test
INSERT INTO employees (seller_id, employee_id, role, is_active, hired_at, permissions)
VALUES 
    ('aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c', 'aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c', 'manager', true, CURRENT_DATE - INTERVAL '90 days', ARRAY['read', 'write', 'manage']);

-- Créer une boutique de test
INSERT INTO seller_shops (seller_id, shop_name, description, is_active, subscription_plan)
VALUES 
    ('aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c', 'Boutique Test 224Solutions', 'Boutique de démonstration pour tester les fonctionnalités', true, 'premium');

-- Créer des conversations de test
INSERT INTO conversations (client_id, seller_id, subject, status)
VALUES 
    ('aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c', 'aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c', 'Support technique - Test', 'active'),
    ('aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c', NULL, 'Demande d''aide générale', 'active');