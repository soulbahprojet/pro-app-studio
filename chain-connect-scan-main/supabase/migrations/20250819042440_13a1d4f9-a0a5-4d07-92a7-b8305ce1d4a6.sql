-- Mettre à jour le rôle de l'utilisateur pour le faire devenir vendeur
UPDATE public.profiles 
SET role = 'seller'::user_role 
WHERE email = 'fusiondigitaleltd@gmail.com';