-- Créer une table pour les paramètres globaux du système
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Policy pour que seuls les PDG puissent gérer les settings
CREATE POLICY "PDG can manage system settings" ON public.system_settings
FOR ALL USING (is_pdg_user());

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_system_settings_updated_at();

-- Insérer les paramètres par défaut
INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES 
('subscription_system_enabled', '{"enabled": true}', 'Active ou désactive le système d''abonnements payants pour forcer le mode gratuit');

-- Créer une fonction pour vérifier si les abonnements sont activés
CREATE OR REPLACE FUNCTION public.is_subscription_system_enabled()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (setting_value->>'enabled')::boolean, 
    true
  ) FROM public.system_settings 
  WHERE setting_key = 'subscription_system_enabled' 
  LIMIT 1;
$$;