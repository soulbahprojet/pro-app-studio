-- Architecture complète de sécurité et gestion des rôles - Version corrigée
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

-- 4. Fonctions privées de sécurité (corrigées pour gérer le type user_role)
CREATE OR REPLACE FUNCTION private.user_has_role(target_role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role::text = target_role
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
     JOIN public.profiles p ON p.role::text = rf.role
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
  SELECT role::text FROM public.profiles WHERE user_id = auth.uid();
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