-- Créer des données de test pour démontrer le système d'employés
-- Utilisons l'utilisateur existant comme vendeur et créons quelques relations d'employés fictives

-- D'abord, créer quelques profils de test basés sur l'utilisateur existant pour simulation
INSERT INTO employees (seller_id, employee_id, role, is_active, hired_at, permissions)
SELECT 
    'aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c'::uuid, -- Votre user_id comme vendeur
    'aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c'::uuid, -- Même utilisateur comme employé (pour demo)
    'manager',
    true,
    CURRENT_DATE - INTERVAL '90 days',
    ARRAY['read', 'write', 'manage']
WHERE NOT EXISTS (
    SELECT 1 FROM employees 
    WHERE seller_id = 'aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c'
    AND employee_id = 'aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c'
);

-- Créer aussi quelques boutiques de démonstration
INSERT INTO seller_shops (seller_id, shop_name, description, is_active, subscription_plan)
VALUES 
    ('aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c', 'Boutique Test 224Solutions', 'Boutique de démonstration pour tester les fonctionnalités', true, 'premium')
ON CONFLICT (seller_id) DO UPDATE SET
    shop_name = EXCLUDED.shop_name,
    description = EXCLUDED.description,
    subscription_plan = EXCLUDED.subscription_plan;

-- Créer quelques conversations de test
INSERT INTO conversations (client_id, seller_id, subject, status, created_at, updated_at)
VALUES 
    ('aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c', 'aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c', 'Support technique - Test', 'active', NOW() - INTERVAL '2 days', NOW()),
    ('aa155dbb-ed06-4b82-bd7c-b4534ddf2e4c', NULL, 'Demande d''aide générale', 'active', NOW() - INTERVAL '1 day', NOW())
ON CONFLICT DO NOTHING;