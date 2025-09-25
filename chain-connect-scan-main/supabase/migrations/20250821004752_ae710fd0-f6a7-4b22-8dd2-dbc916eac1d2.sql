-- Créer quelques données de test pour les employés
-- D'abord, créer quelques profils de test pour les vendeurs et employés
DO $$
DECLARE
    vendeur1_id UUID := gen_random_uuid();
    vendeur2_id UUID := gen_random_uuid();
    employe1_id UUID := gen_random_uuid();
    employe2_id UUID := gen_random_uuid();
    employe3_id UUID := gen_random_uuid();
    manager1_id UUID := gen_random_uuid();
BEGIN
    -- Insérer les profils
    INSERT INTO profiles (user_id, email, full_name, role, readable_id, country) 
    VALUES 
      (vendeur1_id, 'vendeur1@test.com', 'Ahmed Diallo', 'seller', 'VDR-0001', 'Guinea'),
      (vendeur2_id, 'vendeur2@test.com', 'Fatima Camara', 'seller', 'VDR-0002', 'Guinea'),
      (employe1_id, 'employe1@test.com', 'Mamadou Bah', 'client', 'CLT-0001', 'Guinea'),
      (employe2_id, 'employe2@test.com', 'Aissatou Diallo', 'client', 'CLT-0002', 'Guinea'),
      (employe3_id, 'employe3@test.com', 'Oumar Sylla', 'client', 'CLT-0003', 'Guinea'),
      (manager1_id, 'manager1@test.com', 'Ibrahim Conde', 'client', 'CLT-0004', 'Guinea');

    -- Créer les wallets pour les nouveaux profils
    INSERT INTO wallets (user_id) 
    VALUES 
      (vendeur1_id), (vendeur2_id), (employe1_id), 
      (employe2_id), (employe3_id), (manager1_id);

    -- Créer les relations employés
    INSERT INTO employees (seller_id, employee_id, role, is_active, hired_at, permissions)
    VALUES 
      (vendeur1_id, employe1_id, 'assistant', true, CURRENT_DATE - INTERVAL '60 days', ARRAY['read', 'write']),
      (vendeur1_id, manager1_id, 'manager', true, CURRENT_DATE - INTERVAL '120 days', ARRAY['read', 'write', 'manage']),
      (vendeur2_id, employe2_id, 'staff', true, CURRENT_DATE - INTERVAL '45 days', ARRAY['read']),
      (vendeur2_id, employe3_id, 'staff', true, CURRENT_DATE - INTERVAL '30 days', ARRAY['read']);
END $$;