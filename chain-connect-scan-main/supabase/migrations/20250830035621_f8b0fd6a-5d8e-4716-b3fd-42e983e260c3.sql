-- Fix security definer view and TypeScript errors

-- First, let's check what views exist and identify the SECURITY DEFINER one
SELECT schemaname, viewname, definition 
FROM pg_views 
WHERE schemaname = 'public'
AND definition ILIKE '%SECURITY DEFINER%';

-- Drop the problematic security definer view if it exists  
DROP VIEW IF EXISTS public.features_overview;

-- Create necessary tables that were missing from previous migrations
CREATE TABLE IF NOT EXISTS public.role_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  feature text NOT NULL,
  description text,
  requires_subscription boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role, feature)
);

CREATE TABLE IF NOT EXISTS public.vendor_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type text NOT NULL DEFAULT 'basic',
  status text NOT NULL DEFAULT 'active',
  starts_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  features_limit jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on the tables
ALTER TABLE public.role_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for role_features
CREATE POLICY "Anyone can view role features" ON public.role_features
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify role features" ON public.role_features
  FOR ALL USING (is_pdg_user())
  WITH CHECK (is_pdg_user());

-- Create RLS policies for vendor_subscriptions  
CREATE POLICY "Users can view their own subscriptions" ON public.vendor_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage subscriptions" ON public.vendor_subscriptions
  FOR ALL USING (true)
  WITH CHECK (true);

-- Insert basic features for each role if they don't exist
INSERT INTO public.role_features (role, feature, description, requires_subscription) VALUES
  ('seller', 'product_management', 'Gestion des produits', false),
  ('seller', 'basic_inventory', 'Inventaire de base', false),
  ('seller', 'order_processing', 'Traitement des commandes', false),
  ('seller', 'basic_analytics', 'Analyses de base', false),
  ('seller', 'advanced_analytics', 'Analyses avancées', true),
  ('seller', 'priority_support', 'Support prioritaire', true),
  ('client', 'browse_products', 'Parcourir les produits', false),
  ('client', 'place_orders', 'Passer des commandes', false),
  ('client', 'track_orders', 'Suivre les commandes', false),
  ('client', 'manage_favorites', 'Gérer les favoris', false),
  ('courier', 'delivery_assignments', 'Assignations de livraison', false),
  ('courier', 'route_optimization', 'Optimisation d\'itinéraires', false),
  ('courier', 'earnings_tracking', 'Suivi des gains', false),
  ('admin', 'user_management', 'Gestion des utilisateurs', false),
  ('admin', 'system_settings', 'Paramètres système', false),
  ('admin', 'platform_analytics', 'Analyses de plateforme', false)
ON CONFLICT (role, feature) DO NOTHING;

-- Create or update the features_overview view WITHOUT SECURITY DEFINER
CREATE OR REPLACE VIEW public.features_overview AS
SELECT 
  rf.role,
  rf.feature,
  rf.description,
  rf.requires_subscription,
  CASE 
    WHEN uf.enabled IS NOT NULL THEN uf.enabled
    ELSE false
  END as enabled,
  uf.created_at as activation_date
FROM public.role_features rf
LEFT JOIN public.user_features uf ON rf.feature = uf.feature AND rf.role = uf.role;

-- Enable RLS on the view
ALTER VIEW public.features_overview SET (security_barrier = true);

-- Create RLS policy for the view
CREATE POLICY "Users can view features overview" ON public.features_overview
  FOR SELECT USING (true);

-- Create trigger to update vendor_subscriptions timestamp
CREATE OR REPLACE FUNCTION update_vendor_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vendor_subscriptions_updated_at
  BEFORE UPDATE ON public.vendor_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_vendor_subscription_updated_at();