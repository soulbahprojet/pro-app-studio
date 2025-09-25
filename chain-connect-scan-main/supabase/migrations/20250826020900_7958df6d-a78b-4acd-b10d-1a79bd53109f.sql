-- Création des tables manquantes pour le Transitaire International

-- Table pour les expéditions internationales (amélioration de l'existant)
CREATE TABLE IF NOT EXISTS public.international_shipments_complete (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_code TEXT NOT NULL UNIQUE DEFAULT ('INTL-' || LPAD(floor(random() * 10000000)::TEXT, 7, '0')),
  
  -- Informations expéditeur
  sender_name TEXT NOT NULL,
  sender_address TEXT NOT NULL,
  sender_city TEXT NOT NULL,
  sender_country TEXT NOT NULL,
  sender_postal_code TEXT,
  sender_phone TEXT,
  sender_email TEXT,
  
  -- Informations destinataire
  recipient_name TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  recipient_city TEXT NOT NULL,
  recipient_country TEXT NOT NULL,
  recipient_postal_code TEXT,
  recipient_phone TEXT,
  recipient_email TEXT,
  
  -- Détails du colis
  weight_kg NUMERIC NOT NULL CHECK (weight_kg > 0),
  length_cm NUMERIC NOT NULL CHECK (length_cm > 0),
  width_cm NUMERIC NOT NULL CHECK (width_cm > 0),
  height_cm NUMERIC NOT NULL CHECK (height_cm > 0),
  volume_m3 NUMERIC GENERATED ALWAYS AS ((length_cm * width_cm * height_cm) / 1000000) STORED,
  
  -- Marchandise
  commodity_type TEXT NOT NULL,
  commodity_description TEXT,
  commodity_value NUMERIC,
  commodity_currency TEXT DEFAULT 'USD',
  is_dangerous_goods BOOLEAN DEFAULT false,
  is_fragile BOOLEAN DEFAULT false,
  
  -- Service et transport
  service_type TEXT NOT NULL DEFAULT 'standard', -- standard, express, economy
  transport_mode TEXT NOT NULL DEFAULT 'air', -- air, sea, road, multimodal
  carrier_name TEXT,
  carrier_service TEXT,
  
  -- Statut et dates
  status TEXT NOT NULL DEFAULT 'created',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  pickup_date DATE,
  estimated_delivery_date DATE,
  actual_delivery_date DATE,
  
  -- Relations
  customer_id UUID NOT NULL,
  forwarder_id UUID,
  
  -- Coûts
  shipping_cost NUMERIC DEFAULT 0,
  insurance_cost NUMERIC DEFAULT 0,
  customs_duties NUMERIC DEFAULT 0,
  total_cost NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  
  -- Documents et compliance
  customs_declaration_number TEXT,
  awb_number TEXT, -- Air Waybill Number
  bl_number TEXT,  -- Bill of Lading Number
  
  -- Assurance
  insurance_required BOOLEAN DEFAULT false,
  insurance_value NUMERIC DEFAULT 0,
  
  -- Tracking et position
  current_location JSONB,
  route_history JSONB DEFAULT '[]'::jsonb,
  
  -- Métadonnées
  special_instructions TEXT,
  internal_notes TEXT
);

-- Table pour l'historique des statuts
CREATE TABLE IF NOT EXISTS public.shipment_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shipment_id UUID NOT NULL REFERENCES public.international_shipments_complete(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  location TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  updated_by UUID,
  automatic BOOLEAN DEFAULT false
);

-- Table pour les documents douaniers (amélioration)
CREATE TABLE IF NOT EXISTS public.customs_documents_complete (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shipment_id UUID NOT NULL REFERENCES public.international_shipments_complete(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- invoice, certificate_origin, packing_list, customs_declaration, insurance_certificate
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  
  -- Validation
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  rejection_reason TEXT,
  
  -- Métadonnées
  expiry_date DATE,
  document_number TEXT,
  issued_by TEXT,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les tarifs dynamiques
CREATE TABLE IF NOT EXISTS public.shipping_rates_matrix (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Routes
  origin_country TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  
  -- Transport
  transport_mode TEXT NOT NULL, -- air, sea, road, multimodal
  service_type TEXT NOT NULL,   -- standard, express, economy
  carrier_name TEXT,
  
  -- Tarification par poids/volume
  weight_from_kg NUMERIC NOT NULL DEFAULT 0,
  weight_to_kg NUMERIC NOT NULL DEFAULT 999999,
  base_rate_per_kg NUMERIC NOT NULL,
  volumetric_divisor INTEGER DEFAULT 6000, -- Pour le calcul poids volumétrique
  
  -- Frais additionnels
  fuel_surcharge_percentage NUMERIC DEFAULT 0,
  security_fee NUMERIC DEFAULT 0,
  handling_fee NUMERIC DEFAULT 0,
  customs_clearance_fee NUMERIC DEFAULT 0,
  
  -- Assurance
  insurance_rate_percentage NUMERIC DEFAULT 0.1,
  
  -- Validité
  valid_from DATE NOT NULL,
  valid_until DATE,
  is_active BOOLEAN DEFAULT true,
  
  -- Devise
  currency TEXT DEFAULT 'USD',
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les paiements d'expédition
CREATE TABLE IF NOT EXISTS public.shipment_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shipment_id UUID NOT NULL REFERENCES public.international_shipments_complete(id) ON DELETE CASCADE,
  
  -- Montants
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Paiement
  payment_method TEXT NOT NULL, -- stripe, paypal, mobile_money, wallet
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
  payment_intent_id TEXT, -- Stripe Payment Intent ID
  transaction_id TEXT,    -- ID de transaction externe
  
  -- Détails
  payment_date TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  
  -- Facture
  invoice_number TEXT,
  invoice_url TEXT,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les alertes et monitoring AI
CREATE TABLE IF NOT EXISTS public.shipment_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shipment_id UUID NOT NULL REFERENCES public.international_shipments_complete(id) ON DELETE CASCADE,
  
  -- Type d'alerte
  alert_type TEXT NOT NULL, -- delay, stuck, anomaly, security, compliance
  severity TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  
  -- Description
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- AI Analysis
  ai_analysis JSONB,
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Statut
  status TEXT NOT NULL DEFAULT 'active', -- active, acknowledged, resolved, false_positive
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Métadonnées
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_international_shipments_customer ON public.international_shipments_complete(customer_id);
CREATE INDEX IF NOT EXISTS idx_international_shipments_forwarder ON public.international_shipments_complete(forwarder_id);
CREATE INDEX IF NOT EXISTS idx_international_shipments_tracking ON public.international_shipments_complete(tracking_code);
CREATE INDEX IF NOT EXISTS idx_international_shipments_status ON public.international_shipments_complete(status);
CREATE INDEX IF NOT EXISTS idx_status_history_shipment ON public.shipment_status_history(shipment_id);
CREATE INDEX IF NOT EXISTS idx_customs_documents_shipment ON public.customs_documents_complete(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipping_rates_route ON public.shipping_rates_matrix(origin_country, destination_country);
CREATE INDEX IF NOT EXISTS idx_shipment_payments_shipment ON public.shipment_payments(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_alerts_shipment ON public.shipment_alerts(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_alerts_type ON public.shipment_alerts(alert_type);

-- RLS Policies
ALTER TABLE public.international_shipments_complete ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customs_documents_complete ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_rates_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_alerts ENABLE ROW LEVEL SECURITY;

-- Policies pour international_shipments_complete
CREATE POLICY "Customers can view their shipments" ON public.international_shipments_complete
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Customers can create shipments" ON public.international_shipments_complete
  FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can update their shipments" ON public.international_shipments_complete
  FOR UPDATE USING (customer_id = auth.uid());

CREATE POLICY "Forwarders can view their assigned shipments" ON public.international_shipments_complete
  FOR ALL USING (forwarder_id IN (
    SELECT freight_forwarder_profiles.id FROM freight_forwarder_profiles 
    WHERE freight_forwarder_profiles.user_id = auth.uid()
  ));

-- Policies pour shipment_status_history
CREATE POLICY "Users can view status history of their shipments" ON public.shipment_status_history
  FOR SELECT USING (shipment_id IN (
    SELECT id FROM public.international_shipments_complete 
    WHERE customer_id = auth.uid() OR forwarder_id IN (
      SELECT freight_forwarder_profiles.id FROM freight_forwarder_profiles 
      WHERE freight_forwarder_profiles.user_id = auth.uid()
    )
  ));

CREATE POLICY "Forwarders can update status history" ON public.shipment_status_history
  FOR INSERT WITH CHECK (shipment_id IN (
    SELECT id FROM public.international_shipments_complete 
    WHERE forwarder_id IN (
      SELECT freight_forwarder_profiles.id FROM freight_forwarder_profiles 
      WHERE freight_forwarder_profiles.user_id = auth.uid()
    )
  ));

-- Policies pour customs_documents_complete
CREATE POLICY "Users can view customs documents of their shipments" ON public.customs_documents_complete
  FOR SELECT USING (shipment_id IN (
    SELECT id FROM public.international_shipments_complete 
    WHERE customer_id = auth.uid() OR forwarder_id IN (
      SELECT freight_forwarder_profiles.id FROM freight_forwarder_profiles 
      WHERE freight_forwarder_profiles.user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can upload customs documents" ON public.customs_documents_complete
  FOR INSERT WITH CHECK (shipment_id IN (
    SELECT id FROM public.international_shipments_complete 
    WHERE customer_id = auth.uid() OR forwarder_id IN (
      SELECT freight_forwarder_profiles.id FROM freight_forwarder_profiles 
      WHERE freight_forwarder_profiles.user_id = auth.uid()
    )
  ));

-- Policies pour shipping_rates_matrix
CREATE POLICY "Shipping rates are publicly readable" ON public.shipping_rates_matrix
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can manage shipping rates" ON public.shipping_rates_matrix
  FOR ALL USING (is_pdg_user());

-- Policies pour shipment_payments
CREATE POLICY "Users can view payments of their shipments" ON public.shipment_payments
  FOR SELECT USING (shipment_id IN (
    SELECT id FROM public.international_shipments_complete 
    WHERE customer_id = auth.uid()
  ));

CREATE POLICY "System can manage payments" ON public.shipment_payments
  FOR ALL USING (true);

-- Policies pour shipment_alerts
CREATE POLICY "Users can view alerts of their shipments" ON public.shipment_alerts
  FOR SELECT USING (shipment_id IN (
    SELECT id FROM public.international_shipments_complete 
    WHERE customer_id = auth.uid() OR forwarder_id IN (
      SELECT freight_forwarder_profiles.id FROM freight_forwarder_profiles 
      WHERE freight_forwarder_profiles.user_id = auth.uid()
    )
  ));

CREATE POLICY "System can manage alerts" ON public.shipment_alerts
  FOR ALL USING (true);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_international_shipments_updated_at
  BEFORE UPDATE ON public.international_shipments_complete
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customs_documents_updated_at
  BEFORE UPDATE ON public.customs_documents_complete
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shipping_rates_updated_at
  BEFORE UPDATE ON public.shipping_rates_matrix
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shipment_payments_updated_at
  BEFORE UPDATE ON public.shipment_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shipment_alerts_updated_at
  BEFORE UPDATE ON public.shipment_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();