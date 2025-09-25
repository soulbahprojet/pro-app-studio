-- Ajouter 100,000 GNF au solde principal pour les tests
UPDATE wallets 
SET balance_gnf = 100000.00 
WHERE user_id = '79b793c1-3eb4-40da-ba5c-12a4a0ab3180';

-- Créer une transaction d'ajustement pour l'audit trail
INSERT INTO transactions (wallet_id, type, amount, currency, status, description, reference_id)
SELECT 
  id,
  'deposit'::transaction_type,
  100000.00,
  'GNF'::currency_type,
  'completed',
  'Crédit de test pour les fonctionnalités wallet',
  'TEST-' || extract(epoch from now())::text
FROM wallets 
WHERE user_id = '79b793c1-3eb4-40da-ba5c-12a4a0ab3180';