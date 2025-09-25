-- Mettre à jour la boutique 964VY vers un forfait premium
UPDATE public.seller_shops 
SET subscription_plan = 'premium'
WHERE readable_id = '964VY' OR slug = '964VY' OR shop_name LIKE '%964VY%';