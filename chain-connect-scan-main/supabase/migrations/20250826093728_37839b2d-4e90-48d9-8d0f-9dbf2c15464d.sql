-- Corriger les politiques RLS pour la table profiles
-- La table existe mais n'a pas de politiques, d'où le problème d'inscription

-- Créer les politiques RLS pour profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"  
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT  
WITH CHECK (auth.uid() = user_id);

-- Vérifier que RLS est activé sur profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;