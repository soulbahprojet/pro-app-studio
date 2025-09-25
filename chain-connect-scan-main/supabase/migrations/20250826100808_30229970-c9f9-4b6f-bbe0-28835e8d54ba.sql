-- Supprimer la contrainte de clé étrangère qui empêche la suppression des utilisateurs
ALTER TABLE public.pos_sessions DROP CONSTRAINT pos_sessions_seller_id_fkey;

-- Note: Cette contrainte référençait auth.users(id) ce qui bloquait la suppression des utilisateurs
-- La colonne seller_id reste présente mais sans contrainte de clé étrangère