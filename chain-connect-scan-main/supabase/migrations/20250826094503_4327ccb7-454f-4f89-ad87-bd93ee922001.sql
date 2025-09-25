-- Supprimer tous les utilisateurs existants et repartir à zéro

-- Supprimer tous les portefeuilles
DELETE FROM public.wallets WHERE user_id IS NOT NULL;

-- Supprimer tous les profils
DELETE FROM public.profiles WHERE user_id IS NOT NULL;

-- Note: Pour supprimer les utilisateurs de auth.users, cela doit être fait via l'interface Supabase
-- car nous n'avons pas les permissions pour supprimer directement de la table auth.users

-- Vérifier que le trigger est bien en place pour les nouveaux utilisateurs
-- Le trigger handle_new_user_signup est déjà configuré et fonctionnel