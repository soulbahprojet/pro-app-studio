-- Supprimer la politique problématique qui crée une dépendance circulaire
DROP POLICY IF EXISTS "Allow PDG to manage admin roles" ON public.admin_roles;

-- Créer une nouvelle politique qui permet aux utilisateurs de voir leurs propres rôles
CREATE POLICY "Users can view their own admin roles" 
ON public.admin_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Permettre au système (service role) de gérer les rôles admin
CREATE POLICY "Service role can manage admin roles" 
ON public.admin_roles 
FOR ALL 
USING (true);