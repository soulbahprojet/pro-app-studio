-- Architecture complète de sécurité et gestion des rôles
-- Basée sur la documentation fournie

-- 1. Créer le schéma private pour les fonctions de sécurité
CREATE SCHEMA IF NOT EXISTS private;

-- 2. Table audit_logs pour tracer toutes les actions critiques
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  severity TEXT DEFAULT 'INFO' CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour performance sur audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON public.audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON public.audit_logs(action_type);

-- 3. Table role_features pour gérer les fonctionnalités par rôle
CREATE TABLE IF NOT EXISTS public.role_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  feature TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, feature)
);

-- Index pour performance sur role_features
CREATE INDEX IF NOT EXISTS idx_role_features_role ON public.role_features(role);
CREATE INDEX IF NOT EXISTS idx_role_features_feature ON public.role_features(feature);

-- 4. Fonctions privées de sécurité
CREATE OR REPLACE FUNCTION private.user_has_role(target_role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = target_role
  );
$$;

CREATE OR REPLACE FUNCTION private.user_has_feature(feature_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (SELECT rf.enabled 
     FROM public.role_features rf
     JOIN public.profiles p ON p.role = rf.role
     WHERE p.user_id = auth.uid() AND rf.feature = feature_name),
    false
  );
$$;

CREATE OR REPLACE FUNCTION private.get_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

-- 5. Fonction pour logger les événements de sécurité
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action_type TEXT,
  p_table_name TEXT DEFAULT NULL,
  p_record_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_severity TEXT DEFAULT 'INFO',
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id, action_type, table_name, record_id,
    old_values, new_values, severity, metadata
  ) VALUES (
    auth.uid(), p_action_type, p_table_name, p_record_id,
    p_old_values, p_new_values, p_severity, p_metadata
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- 6. Fonction pour vérifier les permissions d'accès aux données
CREATE OR REPLACE FUNCTION private.can_access_data(
  target_user_id UUID,
  data_type TEXT DEFAULT 'profile'
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    -- L'utilisateur peut accéder à ses propres données
    auth.uid() = target_user_id OR
    -- Ou c'est un admin
    private.user_has_role('admin') OR
    -- Ou c'est un PDG
    EXISTS (
      SELECT 1 FROM public.admin_roles 
      WHERE user_id = auth.uid() AND role_type = 'pdg'
    );
$$;

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
      jsonb_build_object('ip', current_setting('request.headers', true)::jsonb->>'x-real-ip')
    );
  ELSIF TG_OP = 'INSERT' THEN
    PERFORM public.log_security_event(
      'profile_create',
      'profiles',
      NEW.user_id,
      NULL,
      to_jsonb(NEW),
      'INFO'
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