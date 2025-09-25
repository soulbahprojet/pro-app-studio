-- SYSTÈME D'ACTIVATION COMPLÈTE DES FONCTIONNALITÉS
-- Création des tables et politiques RLS pour la gestion des fonctionnalités

-- 1. Table role_features pour définir les fonctionnalités par rôle
CREATE TABLE IF NOT EXISTS public.role_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  feature TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  requires_subscription BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, feature)
);

-- 2. Table vendor_subscriptions pour les abonnements vendeurs
CREATE TABLE IF NOT EXISTS public.vendor_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL DEFAULT 'basic',
  status TEXT NOT NULL DEFAULT 'active',
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  features_limit JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Table user_features pour l'activation par utilisateur
CREATE TABLE IF NOT EXISTS public.user_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  feature TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  activated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, feature)
);

-- 4. Enable RLS sur toutes les tables
ALTER TABLE public.role_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_features ENABLE ROW LEVEL SECURITY;

-- 5. Politiques RLS pour role_features
DROP POLICY IF EXISTS "Everyone can view role features" ON public.role_features;
CREATE POLICY "Everyone can view role features"
ON public.role_features FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Only admins can manage role features" ON public.role_features;
CREATE POLICY "Only admins can manage role features"
ON public.role_features FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'
));

-- 6. Politiques RLS pour vendor_subscriptions
DROP POLICY IF EXISTS "Vendors can view their subscriptions" ON public.vendor_subscriptions;
CREATE POLICY "Vendors can view their subscriptions"
ON public.vendor_subscriptions FOR SELECT
USING (vendor_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.vendor_subscriptions;
CREATE POLICY "Admins can manage all subscriptions"
ON public.vendor_subscriptions FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'
));

-- 7. Politiques RLS pour user_features
DROP POLICY IF EXISTS "Users can view their features" ON public.user_features;
CREATE POLICY "Users can view their features"
ON public.user_features FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can manage user features" ON public.user_features;
CREATE POLICY "System can manage user features"
ON public.user_features FOR ALL
USING (true)
WITH CHECK (true);

-- 8. Fonction pour vérifier si une fonctionnalité est activée
CREATE OR REPLACE FUNCTION public.is_feature_enabled(user_role text, feature_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(
        (SELECT enabled FROM public.user_features 
         WHERE role = user_role AND feature = feature_name),
        false
    );
$$;

-- 9. Fonction pour vérifier l'abonnement vendeur
CREATE OR REPLACE FUNCTION public.has_active_vendor_subscription(vendor_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.vendor_subscriptions 
        WHERE vendor_id = vendor_user_id 
        AND status = 'active'
        AND (expires_at IS NULL OR expires_at > now())
    );
$$;

-- 10. Insertion des fonctionnalités de base par rôle
INSERT INTO public.role_features (role, feature, enabled, requires_subscription, description) VALUES
-- Fonctionnalités CLIENT
('client', 'browse_products', true, false, 'Parcourir les produits'),
('client', 'place_orders', true, false, 'Passer des commandes'),
('client', 'track_orders', true, false, 'Suivre les commandes'),
('client', 'manage_favorites', true, false, 'Gérer les favoris'),
('client', 'rate_products', true, false, 'Noter les produits'),
('client', 'customer_support', true, false, 'Support client'),

-- Fonctionnalités VENDOR (BASE)
('vendor', 'product_management', true, false, 'Gestion des produits'),
('vendor', 'basic_inventory', true, false, 'Inventaire de base'),
('vendor', 'order_processing', true, false, 'Traitement des commandes'),
('vendor', 'basic_analytics', true, false, 'Statistiques de base'),

-- Fonctionnalités VENDOR (PREMIUM)
('vendor', 'advanced_analytics', true, true, 'Statistiques avancées'),
('vendor', 'inventory_alerts', true, true, 'Alertes de stock'),
('vendor', 'bulk_operations', true, true, 'Opérations en masse'),
('vendor', 'virtual_wallet', true, true, 'Portefeuille virtuel'),
('vendor', 'commission_management', true, true, 'Gestion des commissions'),
('vendor', 'customer_chat', true, true, 'Chat client'),
('vendor', 'delivery_management', true, true, 'Gestion des livraisons'),
('vendor', 'automated_responses', true, true, 'Réponses automatisées'),

-- Fonctionnalités COURIER
('courier', 'delivery_assignments', true, false, 'Affectations de livraison'),
('courier', 'route_optimization', true, false, 'Optimisation des itinéraires'),
('courier', 'earnings_tracking', true, false, 'Suivi des gains'),
('courier', 'delivery_history', true, false, 'Historique des livraisons'),

-- Fonctionnalités FORWARDER
('forwarder', 'shipment_management', true, false, 'Gestion des expéditions'),
('forwarder', 'customs_handling', true, false, 'Gestion douanière'),
('forwarder', 'client_portal', true, false, 'Portail client'),
('forwarder', 'document_management', true, false, 'Gestion documentaire'),

-- Fonctionnalités ADMIN
('admin', 'user_management', true, false, 'Gestion des utilisateurs'),
('admin', 'system_settings', true, false, 'Paramètres système'),
('admin', 'financial_oversight', true, false, 'Supervision financière'),
('admin', 'platform_analytics', true, false, 'Analytique plateforme'),
('admin', 'content_moderation', true, false, 'Modération de contenu')

ON CONFLICT (role, feature) DO UPDATE SET
enabled = EXCLUDED.enabled,
requires_subscription = EXCLUDED.requires_subscription,
description = EXCLUDED.description,
updated_at = now();

-- 11. Fonction d'activation automatique des fonctionnalités
CREATE OR REPLACE FUNCTION public.activate_user_features(p_user_id uuid, p_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    feature_record RECORD;
    has_subscription boolean := false;
BEGIN
    -- Vérifier l'abonnement pour les vendeurs
    IF p_role = 'vendor' THEN
        has_subscription := public.has_active_vendor_subscription(p_user_id);
    END IF;

    -- Activer toutes les fonctionnalités appropriées
    FOR feature_record IN 
        SELECT feature, requires_subscription 
        FROM public.role_features 
        WHERE role = p_role AND enabled = true
    LOOP
        -- Activer seulement si pas d'abonnement requis OU si l'utilisateur a un abonnement
        IF NOT feature_record.requires_subscription OR has_subscription THEN
            INSERT INTO public.user_features (user_id, role, feature, enabled)
            VALUES (p_user_id, p_role, feature_record.feature, true)
            ON CONFLICT (user_id, feature) DO UPDATE SET
                enabled = true,
                activated_at = now();
        END IF;
    END LOOP;
END;
$$;

-- 12. Trigger pour activation automatique lors de la création/mise à jour du profil
CREATE OR REPLACE FUNCTION public.auto_activate_features()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Activer les fonctionnalités pour le nouveau rôle
    PERFORM public.activate_user_features(NEW.user_id, NEW.role);
    RETURN NEW;
END;
$$;

-- Créer le trigger sur la table profiles
DROP TRIGGER IF EXISTS trigger_auto_activate_features ON public.profiles;
CREATE TRIGGER trigger_auto_activate_features
    AFTER INSERT OR UPDATE OF role ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_activate_features();