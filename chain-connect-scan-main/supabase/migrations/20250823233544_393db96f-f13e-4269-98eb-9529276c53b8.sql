-- Annuler la mise à jour vers premium, garder en basic pour les tests
-- Cette migration annule la précédente
UPDATE public.seller_shops 
SET subscription_plan = 'basic'
WHERE readable_id = '964VY' OR slug = '964VY' OR shop_name LIKE '%964VY%';