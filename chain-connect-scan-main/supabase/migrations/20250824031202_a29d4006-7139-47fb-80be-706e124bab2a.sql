-- Migration pour le module Transitaire International avancé
-- Ajout des nouvelles tables et fonctionnalités

-- 1. Enums pour les nouveaux types
CREATE TYPE freight_forwarder_role AS ENUM ('owner', 'manager', 'scanner', 'tracking', 'client_manager', 'reporter');
CREATE TYPE incident_type AS ENUM ('loss', 'damage', 'theft', 'delay', 'other');
CREATE TYPE incident_status AS ENUM ('pending', 'investigating', 'resolved', 'closed');
CREATE TYPE document_type AS ENUM ('commercial_invoice', 'packing_list', 'bill_of_lading', 'customs_declaration', 'certificate_origin', 'insurance_certificate', 'special_license');
CREATE TYPE incoterm AS ENUM ('EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF');
CREATE TYPE cargo_type AS ENUM ('general', 'dangerous', 'perishable', 'fragile', 'valuable', 'oversized');
CREATE TYPE transport_mode AS ENUM ('air', 'sea', 'road', 'rail', 'multimodal');

-- 2. Table des transitaires (freight forwarders)
CREATE TABLE public.freight_forwarders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  license_number TEXT,
  registration_number TEXT,
  tax_id TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  website_url TEXT,
  description TEXT,
  operating_countries TEXT[],
  services_offered TEXT[],
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  subscription_plan subscription_plan DEFAULT 'basic',
  subscription_expires_at TIMESTAMPTZ,
  rating NUMERIC(3,2) DEFAULT 0.0,
  total_shipments INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Table des entrepôts multi-sites
CREATE TABLE public.freight_warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forwarder_id UUID NOT NULL REFERENCES public.freight_forwarders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  postal_code TEXT,
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  capacity_m3 NUMERIC,
  specializations cargo_type[],
  has_cold_storage BOOLEAN DEFAULT false,
  has_dangerous_goods BOOLEAN DEFAULT false,
  operating_hours JSONB DEFAULT '{}',
  contact_person TEXT,
  contact_phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Table des employés du transitaire
CREATE TABLE public.freight_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forwarder_id UUID NOT NULL REFERENCES public.freight_forwarders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_role freight_forwarder_role NOT NULL,
  permissions JSONB DEFAULT '{}',
  assigned_warehouses UUID[],
  is_active BOOLEAN DEFAULT true,
  hired_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(forwarder_id, user_id)
);

-- 5. Table des expéditions internationales (enrichie)
CREATE TABLE public.international_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_code TEXT UNIQUE NOT NULL DEFAULT ('INTL-' || LPAD(floor(random() * 1000000)::TEXT, 7, '0')),
  forwarder_id UUID NOT NULL REFERENCES public.freight_forwarders(id),
  customer_id UUID NOT NULL REFERENCES auth.users(id),
  assigned_warehouse_id UUID REFERENCES public.freight_warehouses(id),
  
  -- Informations expéditeur/destinataire
  sender_name TEXT NOT NULL,
  sender_address TEXT NOT NULL,
  sender_city TEXT NOT NULL,
  sender_country TEXT NOT NULL,
  sender_phone TEXT,
  sender_email TEXT,
  
  recipient_name TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  recipient_city TEXT NOT NULL,
  recipient_country TEXT NOT NULL,
  recipient_phone TEXT,
  recipient_email TEXT,
  
  -- Détails de la marchandise
  cargo_type cargo_type NOT NULL DEFAULT 'general',
  description TEXT NOT NULL,
  weight_kg NUMERIC NOT NULL,
  volume_m3 NUMERIC,
  dimensions_cm JSONB, -- {length, width, height}
  value_usd NUMERIC,
  
  -- Transport et termes
  transport_mode transport_mode NOT NULL,
  incoterm incoterm NOT NULL DEFAULT 'EXW',
  service_type TEXT NOT NULL, -- Express, Standard, Economy
  
  -- Prix et paiement
  base_price NUMERIC NOT NULL,
  insurance_fee NUMERIC DEFAULT 0,
  customs_fee NUMERIC DEFAULT 0,
  handling_fee NUMERIC DEFAULT 0,
  total_price NUMERIC NOT NULL,
  currency currency_type DEFAULT 'USD',
  
  -- Statut et suivi
  status TEXT NOT NULL DEFAULT 'created',
  priority INTEGER DEFAULT 1, -- 1=normal, 2=urgent, 3=critical
  special_instructions TEXT,
  
  -- Dates importantes
  pickup_date DATE,
  estimated_delivery DATE,
  actual_delivery_date TIMESTAMPTZ,
  
  -- Assurance
  has_insurance BOOLEAN DEFAULT false,
  insurance_amount NUMERIC DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Table de suivi détaillé des expéditions
CREATE TABLE public.shipment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES public.international_shipments(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES public.freight_warehouses(id),
  event_type TEXT NOT NULL, -- pickup, in_transit, customs, delivered, etc.
  location TEXT NOT NULL,
  coordinates JSONB, -- {lat, lng}
  status TEXT NOT NULL,
  description TEXT,
  employee_id UUID REFERENCES public.freight_employees(id),
  scanned_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Table des documents douaniers
CREATE TABLE public.customs_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES public.international_shipments(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  is_required BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES public.freight_employees(id),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Table des incidents de sécurité
CREATE TABLE public.security_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_number TEXT UNIQUE NOT NULL DEFAULT ('INC-' || LPAD(nextval('incident_number_seq')::TEXT, 6, '0')),
  shipment_id UUID REFERENCES public.international_shipments(id),
  forwarder_id UUID NOT NULL REFERENCES public.freight_forwarders(id),
  reported_by UUID REFERENCES public.freight_employees(id),
  
  incident_type incident_type NOT NULL,
  severity INTEGER NOT NULL DEFAULT 1, -- 1=low, 2=medium, 3=high, 4=critical
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  coordinates JSONB,
  
  status incident_status DEFAULT 'pending',
  is_emergency BOOLEAN DEFAULT false,
  
  -- Gestion des dommages
  estimated_loss_usd NUMERIC DEFAULT 0,
  insurance_claim_number TEXT,
  
  -- Photos et preuves
  evidence_files JSONB DEFAULT '[]', -- URLs des fichiers
  
  -- Résolution
  resolution_notes TEXT,
  resolved_by UUID REFERENCES public.freight_employees(id),
  resolved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Table des tarifs par zone
CREATE TABLE public.freight_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forwarder_id UUID NOT NULL REFERENCES public.freight_forwarders(id) ON DELETE CASCADE,
  origin_country TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  transport_mode transport_mode NOT NULL,
  service_type TEXT NOT NULL,
  
  -- Tarification
  base_rate_per_kg NUMERIC NOT NULL,
  base_rate_per_m3 NUMERIC NOT NULL,
  minimum_charge NUMERIC NOT NULL,
  fuel_surcharge_rate NUMERIC DEFAULT 0,
  
  -- Frais additionnels
  handling_fee NUMERIC DEFAULT 0,
  documentation_fee NUMERIC DEFAULT 0,
  customs_clearance_fee NUMERIC DEFAULT 0,
  
  currency currency_type DEFAULT 'USD',
  
  -- Validité
  valid_from DATE NOT NULL,
  valid_until DATE,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Table des réclamations clients
CREATE TABLE public.customer_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number TEXT UNIQUE NOT NULL DEFAULT ('CLM-' || LPAD(nextval('claim_number_seq')::TEXT, 6, '0')),
  shipment_id UUID NOT NULL REFERENCES public.international_shipments(id),
  customer_id UUID NOT NULL REFERENCES auth.users(id),
  forwarder_id UUID NOT NULL REFERENCES public.freight_forwarders(id),
  
  claim_type TEXT NOT NULL, -- delay, damage, loss, poor_service, billing
  priority INTEGER DEFAULT 1,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Compensation demandée
  compensation_requested NUMERIC DEFAULT 0,
  compensation_currency currency_type DEFAULT 'USD',
  
  status TEXT DEFAULT 'open', -- open, investigating, resolved, closed
  
  -- Gestion
  assigned_to UUID REFERENCES public.freight_employees(id),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Séquences pour les numéros
CREATE SEQUENCE IF NOT EXISTS incident_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS claim_number_seq START 1;

-- 12. Index pour les performances
CREATE INDEX idx_international_shipments_tracking ON public.international_shipments(tracking_code);
CREATE INDEX idx_international_shipments_forwarder ON public.international_shipments(forwarder_id);
CREATE INDEX idx_international_shipments_customer ON public.international_shipments(customer_id);
CREATE INDEX idx_international_shipments_status ON public.international_shipments(status);
CREATE INDEX idx_shipment_events_shipment ON public.shipment_events(shipment_id);
CREATE INDEX idx_freight_warehouses_forwarder ON public.freight_warehouses(forwarder_id);
CREATE INDEX idx_freight_employees_forwarder ON public.freight_employees(forwarder_id);
CREATE INDEX idx_security_incidents_forwarder ON public.security_incidents(forwarder_id);
CREATE INDEX idx_customer_claims_shipment ON public.customer_claims(shipment_id);

-- 13. Triggers pour updated_at
CREATE TRIGGER update_freight_forwarders_updated_at
  BEFORE UPDATE ON public.freight_forwarders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_freight_warehouses_updated_at
  BEFORE UPDATE ON public.freight_warehouses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_freight_employees_updated_at
  BEFORE UPDATE ON public.freight_employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_international_shipments_updated_at
  BEFORE UPDATE ON public.international_shipments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customs_documents_updated_at
  BEFORE UPDATE ON public.customs_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_security_incidents_updated_at
  BEFORE UPDATE ON public.security_incidents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_freight_rates_updated_at
  BEFORE UPDATE ON public.freight_rates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_claims_updated_at
  BEFORE UPDATE ON public.customer_claims
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 14. Fonctions utilitaires
CREATE OR REPLACE FUNCTION public.calculate_freight_price(
  p_weight_kg NUMERIC,
  p_volume_m3 NUMERIC,
  p_origin_country TEXT,
  p_destination_country TEXT,
  p_transport_mode transport_mode,
  p_service_type TEXT,
  p_forwarder_id UUID
) RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rate RECORD;
  v_chargeable_weight NUMERIC;
  v_total_price NUMERIC := 0;
BEGIN
  -- Récupérer le tarif applicable
  SELECT * INTO v_rate
  FROM public.freight_rates
  WHERE forwarder_id = p_forwarder_id
    AND origin_country = p_origin_country
    AND destination_country = p_destination_country
    AND transport_mode = p_transport_mode
    AND service_type = p_service_type
    AND is_active = true
    AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN NULL; -- Aucun tarif trouvé
  END IF;
  
  -- Calculer le poids taxable (max entre poids réel et poids volumétrique)
  v_chargeable_weight := GREATEST(p_weight_kg, p_volume_m3 * 167); -- 167 kg/m3 pour l'aérien
  
  -- Calculer le prix de base
  v_total_price := GREATEST(
    v_chargeable_weight * v_rate.base_rate_per_kg,
    p_volume_m3 * v_rate.base_rate_per_m3,
    v_rate.minimum_charge
  );
  
  -- Ajouter les frais additionnels
  v_total_price := v_total_price + 
    COALESCE(v_rate.handling_fee, 0) +
    COALESCE(v_rate.documentation_fee, 0) +
    COALESCE(v_rate.customs_clearance_fee, 0);
  
  -- Ajouter la surcharge carburant
  v_total_price := v_total_price * (1 + COALESCE(v_rate.fuel_surcharge_rate, 0) / 100);
  
  RETURN ROUND(v_total_price, 2);
END;
$$;

-- 15. RLS Policies
ALTER TABLE public.freight_forwarders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freight_warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freight_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.international_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customs_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freight_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_claims ENABLE ROW LEVEL SECURITY;

-- Policies pour freight_forwarders
CREATE POLICY "Transitaires peuvent gérer leur profil" ON public.freight_forwarders
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Clients peuvent voir les transitaires actifs" ON public.freight_forwarders
  FOR SELECT USING (is_active = true AND is_verified = true);

-- Policies pour freight_warehouses
CREATE POLICY "Transitaires peuvent gérer leurs entrepôts" ON public.freight_warehouses
  FOR ALL USING (
    forwarder_id IN (
      SELECT id FROM public.freight_forwarders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Employés peuvent voir leurs entrepôts assignés" ON public.freight_warehouses
  FOR SELECT USING (
    id = ANY(
      SELECT unnest(assigned_warehouses) 
      FROM public.freight_employees 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Policies pour freight_employees
CREATE POLICY "Transitaires peuvent gérer leurs employés" ON public.freight_employees
  FOR ALL USING (
    forwarder_id IN (
      SELECT id FROM public.freight_forwarders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Employés peuvent voir leur profil" ON public.freight_employees
  FOR SELECT USING (user_id = auth.uid());

-- Policies pour international_shipments
CREATE POLICY "Transitaires voient leurs expéditions" ON public.international_shipments
  FOR ALL USING (
    forwarder_id IN (
      SELECT id FROM public.freight_forwarders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Clients voient leurs expéditions" ON public.international_shipments
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Employés voient les expéditions de leur transitaire" ON public.international_shipments
  FOR SELECT USING (
    forwarder_id IN (
      SELECT forwarder_id FROM public.freight_employees WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Policies pour shipment_events
CREATE POLICY "Système peut gérer les événements" ON public.shipment_events
  FOR ALL USING (true);

-- Policies pour customs_documents
CREATE POLICY "Transitaires gèrent documents de leurs expéditions" ON public.customs_documents
  FOR ALL USING (
    shipment_id IN (
      SELECT id FROM public.international_shipments 
      WHERE forwarder_id IN (
        SELECT id FROM public.freight_forwarders WHERE user_id = auth.uid()
      )
    )
  );

-- Policies pour security_incidents
CREATE POLICY "Transitaires gèrent leurs incidents" ON public.security_incidents
  FOR ALL USING (
    forwarder_id IN (
      SELECT id FROM public.freight_forwarders WHERE user_id = auth.uid()
    )
  );

-- Policies pour freight_rates
CREATE POLICY "Transitaires gèrent leurs tarifs" ON public.freight_rates
  FOR ALL USING (
    forwarder_id IN (
      SELECT id FROM public.freight_forwarders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Clients voient les tarifs actifs" ON public.freight_rates
  FOR SELECT USING (is_active = true);

-- Policies pour customer_claims
CREATE POLICY "Transitaires voient réclamations de leurs expéditions" ON public.customer_claims
  FOR ALL USING (
    forwarder_id IN (
      SELECT id FROM public.freight_forwarders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Clients voient leurs réclamations" ON public.customer_claims
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Clients créent des réclamations" ON public.customer_claims
  FOR INSERT WITH CHECK (customer_id = auth.uid());