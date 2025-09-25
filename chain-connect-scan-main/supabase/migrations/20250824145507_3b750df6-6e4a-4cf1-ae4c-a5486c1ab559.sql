-- Table pour stocker les informations de sécurité des appareils
CREATE TABLE IF NOT EXISTS device_security (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_imei TEXT NOT NULL,
  device_model TEXT,
  device_os TEXT,
  device_brand TEXT,
  first_registered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_primary_device BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  security_status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour le tracking de sécurité GPS
CREATE TABLE IF NOT EXISTS security_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_imei TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  accuracy NUMERIC,
  speed NUMERIC,
  battery_level INTEGER,
  network_type TEXT,
  is_emergency BOOLEAN DEFAULT false,
  address_text TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les alertes de sécurité
CREATE TABLE IF NOT EXISTS security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'unauthorized_login', 'device_change', 'location_lost', 'emergency'
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  message TEXT NOT NULL,
  device_imei TEXT,
  location_data JSONB,
  is_read BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les commandes de sécurité à distance
CREATE TABLE IF NOT EXISTS remote_security_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  command_type TEXT NOT NULL, -- 'lock_device', 'unlock_device', 'locate_device', 'wipe_data'
  target_device_imei TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'executed', 'failed'
  execution_data JSONB,
  executed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE device_security ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE remote_security_commands ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour device_security
CREATE POLICY "Users can manage their own device security"
ON device_security FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Politiques RLS pour security_tracking
CREATE POLICY "Users can manage their own security tracking"
ON security_tracking FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Politiques RLS pour security_alerts
CREATE POLICY "Users can view their own security alerts"
ON security_alerts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create security alerts"
ON security_alerts FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own alerts"
ON security_alerts FOR UPDATE
USING (auth.uid() = user_id);

-- Politiques RLS pour remote_security_commands
CREATE POLICY "Users can manage their own remote commands"
ON remote_security_commands FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Index pour améliorer les performances
CREATE INDEX idx_device_security_user_id ON device_security(user_id);
CREATE INDEX idx_device_security_imei ON device_security(device_imei);
CREATE INDEX idx_security_tracking_user_id ON security_tracking(user_id);
CREATE INDEX idx_security_tracking_timestamp ON security_tracking(timestamp DESC);
CREATE INDEX idx_security_alerts_user_id ON security_alerts(user_id);
CREATE INDEX idx_security_alerts_created ON security_alerts(created_at DESC);
CREATE INDEX idx_remote_commands_user_id ON remote_security_commands(user_id);
CREATE INDEX idx_remote_commands_status ON remote_security_commands(status);

-- Fonction pour nettoyer les anciens enregistrements de tracking
CREATE OR REPLACE FUNCTION cleanup_old_security_tracking()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Garder seulement les 30 derniers jours de tracking
  DELETE FROM security_tracking 
  WHERE created_at < (now() - interval '30 days');
  
  -- Garder seulement les 90 derniers jours d'alertes résolues
  DELETE FROM security_alerts 
  WHERE is_resolved = true 
  AND resolved_at < (now() - interval '90 days');
  
  -- Supprimer les commandes expirées
  DELETE FROM remote_security_commands 
  WHERE expires_at < now();
END;
$$;