-- Corriger les politiques RLS pour admin_roles qui permettent l'accès anonyme

-- Supprimer l'ancienne politique trop permissive
DROP POLICY IF EXISTS "System can manage admin roles" ON public.admin_roles;

-- Créer une nouvelle politique plus sécurisée pour la gestion des rôles admin
-- Seuls les utilisateurs PDG peuvent gérer les rôles admin
CREATE POLICY "Only PDG users can manage admin roles" 
ON public.admin_roles 
FOR ALL 
USING (is_pdg_user())
WITH CHECK (is_pdg_user());

-- Vérifier que la politique pour les utilisateurs authentifiés est correcte
-- (Elle semble déjà sécurisée avec auth.uid() IS NOT NULL)

-- Optionnel: Ajouter une politique spécifique pour l'insertion par des utilisateurs authentifiés
CREATE POLICY "Authenticated users can insert their own admin role" 
ON public.admin_roles 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);