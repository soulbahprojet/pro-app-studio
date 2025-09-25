-- Mettre l'utilisateur actuel sur le forfait Premium
UPDATE public.profiles 
SET 
  subscription_plan = 'premium',
  subscription_expires_at = NOW() + INTERVAL '1 month',
  updated_at = NOW()
WHERE user_id = auth.uid();