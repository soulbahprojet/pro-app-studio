-- FINALISATION DU SYSTÈME D'ACTIVATION DES FONCTIONNALITÉS
-- Activation automatique pour tous les utilisateurs existants

-- 1. Activer les fonctionnalités pour tous les utilisateurs existants
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT user_id, role FROM public.profiles WHERE role IS NOT NULL
    LOOP
        PERFORM public.activate_user_features(user_record.user_id, user_record.role::text);
    END LOOP;
END $$;

-- 2. Créer des abonnements de base pour tous les vendeurs existants
INSERT INTO public.vendor_subscriptions (vendor_id, plan_type, status, starts_at, expires_at)
SELECT 
    user_id,
    'basic',
    'active',
    now(),
    NULL -- Basic plan never expires
FROM public.profiles 
WHERE role = 'seller'
ON CONFLICT (vendor_id) DO NOTHING;

-- 3. Fonction pour obtenir le statut global des fonctionnalités
CREATE OR REPLACE FUNCTION public.get_user_feature_status(p_user_id uuid)
RETURNS TABLE(
    feature_name text,
    is_enabled boolean,
    requires_subscription boolean,
    has_subscription boolean,
    description text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role text;
    has_active_subscription boolean := false;
BEGIN
    -- Obtenir le rôle de l'utilisateur
    SELECT role INTO user_role FROM public.profiles WHERE user_id = p_user_id;
    
    IF user_role IS NULL THEN
        RETURN;
    END IF;
    
    -- Vérifier l'abonnement pour les vendeurs
    IF user_role = 'seller' THEN
        has_active_subscription := public.has_active_vendor_subscription(p_user_id);
    END IF;
    
    -- Retourner le statut de toutes les fonctionnalités
    RETURN QUERY
    SELECT 
        rf.feature,
        CASE 
            WHEN rf.requires_subscription AND user_role = 'seller' THEN has_active_subscription
            ELSE rf.enabled
        END as is_enabled,
        rf.requires_subscription,
        has_active_subscription,
        rf.description
    FROM public.role_features rf
    WHERE rf.role = user_role
    ORDER BY rf.requires_subscription, rf.feature;
END;
$$;

-- 4. Vue pour le monitoring des fonctionnalités
CREATE OR REPLACE VIEW public.features_overview AS
SELECT 
    p.role,
    COUNT(rf.feature) as total_features,
    COUNT(CASE WHEN rf.requires_subscription THEN 1 END) as premium_features,
    COUNT(CASE WHEN rf.enabled THEN 1 END) as enabled_features
FROM public.profiles p
LEFT JOIN public.role_features rf ON rf.role = p.role::text
WHERE p.role IS NOT NULL
GROUP BY p.role;

-- 5. Politique RLS pour la vue
ALTER VIEW public.features_overview SET (security_barrier = true);

-- 6. Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_features_user_enabled ON public.user_features(user_id, enabled);
CREATE INDEX IF NOT EXISTS idx_role_features_role_enabled ON public.role_features(role, enabled);
CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_active ON public.vendor_subscriptions(vendor_id, status, expires_at);

-- 7. Trigger pour nettoyer les fonctionnalités expirées
CREATE OR REPLACE FUNCTION public.cleanup_expired_features()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Désactiver les fonctionnalités expirées
    UPDATE public.user_features 
    SET enabled = false 
    WHERE expires_at IS NOT NULL AND expires_at < now();
    
    -- Réactiver les fonctionnalités pour les abonnements renouvelés
    UPDATE public.user_features uf
    SET enabled = true, expires_at = NULL
    FROM public.vendor_subscriptions vs
    WHERE uf.user_id = vs.vendor_id
    AND vs.status = 'active'
    AND (vs.expires_at IS NULL OR vs.expires_at > now())
    AND uf.feature IN (
        SELECT feature FROM public.role_features 
        WHERE role = 'seller' AND requires_subscription = true
    );
END;
$$;

-- 8. Planifier le nettoyage (à exécuter périodiquement)
-- Note: La planification automatique nécessiterait pg_cron
-- Pour l'instant, cette fonction peut être appelée manuellement ou via un cron job externe