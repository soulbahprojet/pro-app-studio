-- Améliorer la table device_security pour la gestion multi-appareils
ALTER TABLE device_security ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false;
ALTER TABLE device_security ADD COLUMN IF NOT EXISTS blocked_at timestamp with time zone;
ALTER TABLE device_security ADD COLUMN IF NOT EXISTS blocked_reason text;
ALTER TABLE device_security ADD COLUMN IF NOT EXISTS data_wiped_at timestamp with time zone;

-- Ajouter une contrainte pour empêcher plusieurs appareils actifs par utilisateur
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_primary_device 
ON device_security(user_id) 
WHERE is_primary_device = true AND is_active = true AND is_blocked = false;

-- Table pour les rapports IMEI officiels
CREATE TABLE IF NOT EXISTS imei_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  device_imei text NOT NULL,
  report_type text NOT NULL DEFAULT 'theft_loss',
  report_date timestamp with time zone NOT NULL DEFAULT now(),
  last_known_location jsonb,
  user_declaration text NOT NULL,
  official_report_number text,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS policies pour imei_reports
ALTER TABLE imei_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own IMEI reports"
ON imei_reports
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fonction pour générer un numéro de rapport officiel
CREATE OR REPLACE FUNCTION generate_report_number()
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'RPT-' || TO_CHAR(now(), 'YYYY') || '-' || LPAD(nextval('report_number_seq')::TEXT, 6, '0');
END;
$$;

-- Créer la séquence pour les numéros de rapport
CREATE SEQUENCE IF NOT EXISTS report_number_seq START 1;

-- Trigger pour auto-générer le numéro de rapport
CREATE OR REPLACE FUNCTION set_report_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.official_report_number IS NULL THEN
    NEW.official_report_number := generate_report_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_imei_report_number
  BEFORE INSERT ON imei_reports
  FOR EACH ROW
  EXECUTE FUNCTION set_report_number();

-- Nouvelles commandes à distance pour effacement
ALTER TABLE remote_security_commands ADD COLUMN IF NOT EXISTS execution_result jsonb;
ALTER TABLE remote_security_commands ADD COLUMN IF NOT EXISTS executed_at timestamp with time zone;

-- Index pour optimiser les requêtes de sécurité
CREATE INDEX IF NOT EXISTS idx_security_tracking_emergency ON security_tracking(user_id, is_emergency, timestamp);
CREATE INDEX IF NOT EXISTS idx_security_alerts_unread ON security_alerts(user_id, is_read, created_at);
CREATE INDEX IF NOT EXISTS idx_device_security_active ON device_security(user_id, is_active, is_blocked);