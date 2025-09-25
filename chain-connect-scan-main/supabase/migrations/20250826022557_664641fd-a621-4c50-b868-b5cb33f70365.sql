-- Tables pour la version Ultra-Professionnelle du Transitaire International

-- Table pour gestion SLA dynamique
CREATE TABLE public.shipment_sla (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL,
  sla_type TEXT NOT NULL, -- 'express', 'standard', 'fragile', 'dangerous'
  promised_delivery TIMESTAMPTZ NOT NULL,
  actual_delivery TIMESTAMPTZ,
  status TEXT DEFAULT 'active', -- 'active', 'met', 'breached', 'escalated'
  escalation_level INTEGER DEFAULT 0,
  compensation_amount NUMERIC DEFAULT 0,
  compensation_currency TEXT DEFAULT 'USD',
  breach_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table pour performance des transporteurs
CREATE TABLE public.carrier_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id UUID NOT NULL,
  route_origin TEXT NOT NULL,
  route_destination TEXT NOT NULL,
  average_delivery_time INTERVAL,
  on_time_percentage NUMERIC DEFAULT 0,
  total_shipments INTEGER DEFAULT 0,
  successful_deliveries INTEGER DEFAULT 0,
  failed_deliveries INTEGER DEFAULT 0,
  average_cost NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  customer_rating NUMERIC DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table pour optimisation des routes
CREATE TABLE public.route_optimization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_address TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  optimization_type TEXT NOT NULL, -- 'fastest', 'cheapest', 'balanced', 'eco'
  recommended_carrier UUID,
  estimated_time INTERVAL,
  estimated_cost NUMERIC,
  currency TEXT DEFAULT 'USD',
  route_polyline TEXT,
  waypoints JSONB DEFAULT '[]',
  traffic_data JSONB DEFAULT '{}',
  weather_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  ai_confidence_score NUMERIC DEFAULT 0
);

-- Table pour gestion des assurances
CREATE TABLE public.shipment_insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL,
  insurance_type TEXT NOT NULL, -- 'basic', 'premium', 'full_coverage'
  coverage_amount NUMERIC NOT NULL,
  premium_amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  provider TEXT NOT NULL,
  policy_number TEXT,
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ,
  claim_status TEXT DEFAULT 'none', -- 'none', 'pending', 'approved', 'denied'
  claim_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table pour détection de fraude
CREATE TABLE public.fraud_detection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- 'shipment', 'user', 'payment'
  entity_id UUID NOT NULL,
  risk_score NUMERIC NOT NULL DEFAULT 0, -- 0-100
  risk_level TEXT NOT NULL DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
  flags JSONB DEFAULT '[]',
  ai_analysis JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active', -- 'active', 'resolved', 'false_positive'
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table pour multi-transporteurs
CREATE TABLE public.carrier_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  service_types TEXT[] DEFAULT '{}',
  coverage_areas TEXT[] DEFAULT '{}',
  pricing_model JSONB DEFAULT '{}',
  api_endpoint TEXT,
  api_key_hash TEXT,
  is_active BOOLEAN DEFAULT true,
  performance_rating NUMERIC DEFAULT 0,
  reliability_score NUMERIC DEFAULT 0,
  cost_competitiveness NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table pour analytics avancées
CREATE TABLE public.shipment_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  metric_type TEXT NOT NULL, -- 'delivery_time', 'cost', 'satisfaction', 'sla_breach'
  value NUMERIC NOT NULL,
  carrier_id UUID,
  route TEXT,
  shipment_type TEXT,
  additional_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table pour notifications intelligentes
CREATE TABLE public.intelligent_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL,
  notification_type TEXT NOT NULL, -- 'sla_warning', 'route_optimized', 'fraud_detected'
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'critical'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  channels TEXT[] DEFAULT '{"push"}', -- 'push', 'email', 'sms', 'whatsapp'
  metadata JSONB DEFAULT '{}',
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shipment_sla ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carrier_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_optimization ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_detection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carrier_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intelligent_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour shipment_sla
CREATE POLICY "Users can view SLA of their shipments" ON public.shipment_sla
FOR SELECT USING (
  shipment_id IN (
    SELECT id FROM shipments_international_extended 
    WHERE customer_id = auth.uid() OR forwarder_id IN (
      SELECT id FROM freight_forwarder_profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Forwarders can manage SLA" ON public.shipment_sla
FOR ALL USING (
  shipment_id IN (
    SELECT id FROM shipments_international_extended 
    WHERE forwarder_id IN (
      SELECT id FROM freight_forwarder_profiles WHERE user_id = auth.uid()
    )
  )
);

-- RLS Policies pour carrier_performance
CREATE POLICY "Carrier performance is readable by all" ON public.carrier_performance
FOR SELECT USING (true);

CREATE POLICY "Only admins can modify carrier performance" ON public.carrier_performance
FOR ALL USING (is_pdg_user());

-- RLS Policies pour route_optimization
CREATE POLICY "Users can view their route optimizations" ON public.route_optimization
FOR SELECT USING (true);

CREATE POLICY "System can create route optimizations" ON public.route_optimization
FOR INSERT WITH CHECK (true);

-- RLS Policies pour shipment_insurance
CREATE POLICY "Users can view insurance of their shipments" ON public.shipment_insurance
FOR SELECT USING (
  shipment_id IN (
    SELECT id FROM shipments_international_extended 
    WHERE customer_id = auth.uid() OR forwarder_id IN (
      SELECT id FROM freight_forwarder_profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Forwarders can manage insurance" ON public.shipment_insurance
FOR ALL USING (
  shipment_id IN (
    SELECT id FROM shipments_international_extended 
    WHERE forwarder_id IN (
      SELECT id FROM freight_forwarder_profiles WHERE user_id = auth.uid()
    )
  )
);

-- RLS Policies pour fraud_detection
CREATE POLICY "Users can view their fraud reports" ON public.fraud_detection
FOR SELECT USING (entity_id = auth.uid() OR is_pdg_user());

CREATE POLICY "System can manage fraud detection" ON public.fraud_detection
FOR ALL USING (true);

-- RLS Policies pour carrier_options
CREATE POLICY "Carrier options are readable by all" ON public.carrier_options
FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can modify carriers" ON public.carrier_options
FOR ALL USING (is_pdg_user());

-- RLS Policies pour shipment_analytics
CREATE POLICY "Analytics are readable by all" ON public.shipment_analytics
FOR SELECT USING (true);

CREATE POLICY "System can create analytics" ON public.shipment_analytics
FOR INSERT WITH CHECK (true);

-- RLS Policies pour intelligent_notifications
CREATE POLICY "Users can view their notifications" ON public.intelligent_notifications
FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON public.intelligent_notifications
FOR UPDATE USING (recipient_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.intelligent_notifications
FOR INSERT WITH CHECK (true);

-- Fonctions de trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_pro() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_shipment_sla_updated_at
  BEFORE UPDATE ON public.shipment_sla
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_pro();

CREATE TRIGGER update_shipment_insurance_updated_at
  BEFORE UPDATE ON public.shipment_insurance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_pro();

CREATE TRIGGER update_fraud_detection_updated_at
  BEFORE UPDATE ON public.fraud_detection
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_pro();

CREATE TRIGGER update_carrier_options_updated_at
  BEFORE UPDATE ON public.carrier_options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_pro();