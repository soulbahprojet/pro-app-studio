-- Tables pour le système de sécurité et surveillance
-- Table des alertes de sécurité
CREATE TABLE security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL, -- 'login_attempt', 'suspicious_order', 'fraud_detection', etc.
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  user_id UUID,
  ip_address INET,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  auto_action_taken TEXT, -- 'blocked', 'suspended', 'flagged', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table de tracking de sécurité 
CREATE TABLE security_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  device_id TEXT,
  ip_address INET,
  location JSONB, -- {lat, lng, country, city}
  action_type TEXT NOT NULL, -- 'login', 'order', 'payment', 'profile_update', etc.
  details JSONB DEFAULT '{}',
  risk_score INTEGER DEFAULT 0, -- 0-100
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des commandes de sécurité distantes
CREATE TABLE remote_security_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id UUID,
  target_device_id TEXT,
  command_type TEXT NOT NULL, -- 'block_device', 'wipe_data', 'force_logout', etc.
  status TEXT DEFAULT 'pending', -- 'pending', 'executed', 'failed'
  executed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '24 hours'),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour performances
CREATE INDEX idx_security_alerts_user_id ON security_alerts(user_id);
CREATE INDEX idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX idx_security_alerts_created_at ON security_alerts(created_at);
CREATE INDEX idx_security_tracking_user_id ON security_tracking(user_id);
CREATE INDEX idx_security_tracking_ip ON security_tracking(ip_address);
CREATE INDEX idx_security_tracking_created_at ON security_tracking(created_at);

-- RLS Policies
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE remote_security_commands ENABLE ROW LEVEL SECURITY;

-- PDG peut tout voir et gérer
CREATE POLICY "PDG can manage all security alerts" ON security_alerts
  FOR ALL USING (is_pdg_user());

CREATE POLICY "PDG can manage all security tracking" ON security_tracking
  FOR ALL USING (is_pdg_user());

CREATE POLICY "PDG can manage remote commands" ON remote_security_commands
  FOR ALL USING (is_pdg_user());

-- Users peuvent voir leurs propres alertes
CREATE POLICY "Users can view their security alerts" ON security_alerts
  FOR SELECT USING (auth.uid() = user_id);

-- Users peuvent voir leur tracking
CREATE POLICY "Users can view their tracking" ON security_tracking
  FOR SELECT USING (auth.uid() = user_id);

-- Function pour nettoyer les anciennes données
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