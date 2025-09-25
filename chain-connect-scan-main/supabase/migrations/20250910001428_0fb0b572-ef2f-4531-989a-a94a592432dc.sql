-- Désactiver temporairement la vérification d'email pour permettre la connexion
-- Cette solution permet aux utilisateurs de se connecter sans confirmation d'email

-- Mettre à jour la configuration pour désactiver la confirmation d'email
UPDATE auth.config 
SET 
  email_confirm_enabled = false,
  email_signup_enabled = true
WHERE 1=1;