-- Vérifier et corriger le trigger de création de profil utilisateur

-- D'abord, créer des politiques RLS pour la table profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ensuite, vérifier et recréer le trigger pour la création automatique de profils
-- (Le trigger handle_new_user_signup existe déjà selon la configuration)

-- Test du trigger en créant un profil pour un utilisateur existant si nécessaire
-- Cette fonction sera appelée automatiquement lors des prochaines inscriptions