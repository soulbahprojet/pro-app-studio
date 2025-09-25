-- Upgrader l'utilisateur au plan premium
UPDATE public.profiles 
SET subscription_plan = 'premium',
    subscription_expires_at = now() + interval '1 year'
WHERE email = 'fusiondigitaleltd@gmail.com';

-- S'assurer que le système d'abonnements est désactivé
INSERT INTO public.system_settings (setting_key, setting_value, description)
VALUES ('subscription_system_enabled', '{"enabled": false}', 'Contrôle global du système d''abonnements payants')
ON CONFLICT (setting_key) 
DO UPDATE SET 
  setting_value = '{"enabled": false}',
  updated_at = now();

-- Mettre tous les utilisateurs en premium si le système est désactivé
UPDATE public.profiles 
SET subscription_plan = 'premium',
    subscription_expires_at = now() + interval '1 year'
WHERE subscription_plan != 'premium';