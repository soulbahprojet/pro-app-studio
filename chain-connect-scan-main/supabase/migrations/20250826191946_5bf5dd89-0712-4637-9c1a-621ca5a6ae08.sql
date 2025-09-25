-- Correction massive des politiques d'accès anonyme (Partie 3)
-- Gestion des conflits et continuation des corrections

-- 12. Corriger les politiques de produits et inventaire
DROP POLICY IF EXISTS "Public can view products" ON public.products;
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
CREATE POLICY "Authenticated users can view active products" 
ON public.products 
FOR SELECT 
TO authenticated 
USING (is_active = true);

-- 13. Corriger les politiques de commandes
DROP POLICY IF EXISTS "Public can view orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;

-- 14. Corriger les politiques de profils
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Seuls les utilisateurs authentifiés peuvent voir les profils publics
CREATE POLICY "Authenticated users can view public profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (is_public_profile = true OR user_id = auth.uid());

-- 15. Corriger les politiques de magasins
DROP POLICY IF EXISTS "Public can view shops" ON public.seller_shops;
DROP POLICY IF EXISTS "Anyone can view shops" ON public.seller_shops;
CREATE POLICY "Authenticated users can view active shops" 
ON public.seller_shops 
FOR SELECT 
TO authenticated 
USING (is_active = true);

-- 16. Corriger les politiques de warehouses
DROP POLICY IF EXISTS "Public can view warehouses" ON public.warehouses;
DROP POLICY IF EXISTS "Anyone can view warehouses" ON public.warehouses;
CREATE POLICY "Authenticated users can view active warehouses" 
ON public.warehouses 
FOR SELECT 
TO authenticated 
USING (is_active = true);

-- 17. Corriger les politiques de reviews
DROP POLICY IF EXISTS "Public can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
CREATE POLICY "Authenticated users can view approved reviews" 
ON public.reviews 
FOR SELECT 
TO authenticated 
USING (status = 'approved');

-- 18. Corriger les politiques de catégories
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
CREATE POLICY "Authenticated users can view active categories" 
ON public.categories 
FOR SELECT 
TO authenticated 
USING (is_active = true);

-- 19. Corriger les politiques de notifications système
DROP POLICY IF EXISTS "Public can view system notifications" ON public.system_notifications;
DROP POLICY IF EXISTS "Anyone can view system notifications" ON public.system_notifications;

-- 20. Ajouter des politiques manquantes pour la sécurité
-- S'assurer que seuls les utilisateurs authentifiés peuvent accéder aux données sensibles

-- Politique pour les tokens FCM - restriction totale sauf pour l'utilisateur
ALTER TABLE public.fcm_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own FCM tokens" 
ON public.fcm_tokens 
FOR ALL 
TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());