-- Compléter l'architecture de sécurité avec RLS et triggers
-- Suite de la migration précédente

-- 7. RLS sur audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs"
ON public.audit_logs FOR SELECT
USING (auth.uid() = user_id OR private.user_has_role('admin'));

CREATE POLICY "System can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Only admins can update/delete audit logs"
ON public.audit_logs FOR ALL
USING (private.user_has_role('admin'))
WITH CHECK (private.user_has_role('admin'));

-- 8. RLS sur role_features
ALTER TABLE public.role_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view role features"
ON public.role_features FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage role features"
ON public.role_features FOR ALL
USING (private.user_has_role('admin'))
WITH CHECK (private.user_has_role('admin'));

-- 9. Trigger pour logger automatiquement les changements de profil
CREATE OR REPLACE FUNCTION public.trigger_audit_profile_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    PERFORM public.log_security_event(
      'profile_update',
      'profiles',
      NEW.user_id,
      to_jsonb(OLD),
      to_jsonb(NEW),
      'INFO',
      jsonb_build_object('trigger', 'profile_audit')
    );
  ELSIF TG_OP = 'INSERT' THEN
    PERFORM public.log_security_event(
      'profile_create',
      'profiles',
      NEW.user_id,
      NULL,
      to_jsonb(NEW),
      'INFO',
      jsonb_build_object('trigger', 'profile_audit')
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Activer le trigger sur la table profiles
DROP TRIGGER IF EXISTS audit_profile_changes ON public.profiles;
CREATE TRIGGER audit_profile_changes
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_profile_changes();

-- 10. Insérer les fonctionnalités de base par rôle
INSERT INTO public.role_features (role, feature, enabled) VALUES
  ('client', 'marketplace', true),
  ('client', 'orders', true),
  ('client', 'payments', true),
  ('client', 'wallet', true),
  ('client', 'digital_store', true),
  ('client', 'virtual_cards', true),
  ('seller', 'vendor_dashboard', true),
  ('seller', 'product_management', true),
  ('seller', 'order_management', true),
  ('seller', 'analytics', true),
  ('seller', 'wallet', true),
  ('courier', 'delivery_tracking', true),
  ('courier', 'gps_tracking', true),
  ('courier', 'earnings', true),
  ('taxi_moto', 'ride_management', true),
  ('taxi_moto', 'gps_tracking', true),
  ('taxi_moto', 'earnings', true),
  ('transitaire', 'freight_management', true),
  ('transitaire', 'shipment_tracking', true),
  ('transitaire', 'customs_documents', true),
  ('admin', 'all_features', true),
  ('admin', 'user_management', true),
  ('admin', 'system_settings', true),
  ('admin', 'security_audit', true)
ON CONFLICT (role, feature) DO NOTHING;

-- 11. Vue sécurisée pour les statistiques d'audit
CREATE OR REPLACE VIEW public.security_stats AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  severity,
  action_type,
  COUNT(*) as event_count
FROM public.audit_logs
WHERE private.user_has_role('admin')
GROUP BY DATE_TRUNC('day', created_at), severity, action_type
ORDER BY date DESC;

-- 12. Fonction pour détecter les tentatives d'accès suspect
CREATE OR REPLACE FUNCTION public.detect_suspicious_activity()
RETURNS TABLE(
  user_id UUID,
  suspicious_events BIGINT,
  last_violation TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    al.user_id,
    COUNT(*) as suspicious_events,
    MAX(al.created_at) as last_violation
  FROM public.audit_logs al
  WHERE al.severity IN ('WARNING', 'CRITICAL')
    AND al.created_at > now() - INTERVAL '24 hours'
    AND private.user_has_role('admin')
  GROUP BY al.user_id
  HAVING COUNT(*) > 5
  ORDER BY suspicious_events DESC;
$$;