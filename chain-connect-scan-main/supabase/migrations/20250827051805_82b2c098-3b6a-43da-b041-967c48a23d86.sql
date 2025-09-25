-- Table pour gérer les fonctionnalités par rôle
CREATE TABLE public.user_features (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    role TEXT NOT NULL,
    feature TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(role, feature)
);

-- Enable RLS
ALTER TABLE public.user_features ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Admins can manage all features" 
ON public.user_features 
FOR ALL 
USING (is_pdg_user())
WITH CHECK (is_pdg_user());

CREATE POLICY "Users can view their role features" 
ON public.user_features 
FOR SELECT 
USING (
    role = (
        SELECT profiles.role::text 
        FROM profiles 
        WHERE profiles.user_id = auth.uid()
    )
);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_user_features_updated_at
    BEFORE UPDATE ON public.user_features
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Table pour les configurations système
CREATE TABLE public.system_configurations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    config_key TEXT NOT NULL UNIQUE,
    config_value JSONB NOT NULL DEFAULT '{}',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS pour system_configurations
ALTER TABLE public.system_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only PDG can manage system configurations" 
ON public.system_configurations 
FOR ALL 
USING (is_pdg_user())
WITH CHECK (is_pdg_user());

-- Trigger pour system_configurations
CREATE TRIGGER update_system_configurations_updated_at
    BEFORE UPDATE ON public.system_configurations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer la configuration initiale des fonctionnalités
INSERT INTO public.system_configurations (config_key, config_value, description) VALUES
('features_activation_status', '{"activated": false, "last_activation": null}', 'Statut activation des fonctionnalites systeme');

-- Fonction pour vérifier si une fonctionnalité est activée pour un rôle
CREATE OR REPLACE FUNCTION public.is_feature_enabled(user_role TEXT, feature_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
    SELECT COALESCE(
        (SELECT enabled FROM public.user_features 
         WHERE role = user_role AND feature = feature_name),
        false
    );
$$;