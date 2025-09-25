-- Extension des tables existantes pour le module transitaire avancé

-- Table pour la gestion des profils de transitaires
CREATE TABLE IF NOT EXISTS public.freight_forwarder_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_address TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  website_url TEXT,
  transport_types TEXT[] DEFAULT ARRAY['air', 'sea', 'road', 'combined'],
  storage_capacity_m3 NUMERIC DEFAULT 0,
  licenses JSONB DEFAULT '{}',
  certifications JSONB DEFAULT '{}',
  operating_countries TEXT[] DEFAULT ARRAY[]::TEXT[],
  subscription_plan TEXT DEFAULT 'basic',
  subscription_expires_at TIMESTAMPTZ,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Table pour la gestion des entrepôts
CREATE TABLE IF NOT EXISTS public.freight_warehouses_extended (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forwarder_id UUID NOT NULL REFERENCES public.freight_forwarder_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  capacity_m3 NUMERIC DEFAULT 0,
  current_occupancy_m3 NUMERIC DEFAULT 0,
  allowed_cargo_types TEXT[] DEFAULT ARRAY['general', 'dangerous', 'perishable', 'valuable'],
  temperature_controlled BOOLEAN DEFAULT false,
  humidity_controlled BOOLEAN DEFAULT false,
  security_level INTEGER DEFAULT 1, -- 1-5 security levels
  operating_hours JSONB DEFAULT '{"monday": "08:00-18:00", "tuesday": "08:00-18:00", "wednesday": "08:00-18:00", "thursday": "08:00-18:00", "friday": "08:00-18:00", "saturday": "08:00-14:00", "sunday": "closed"}',
  contact_person TEXT,
  contact_phone TEXT,
  special_equipment JSONB DEFAULT '{}',
  customs_clearance BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table pour la gestion des employés avec rôles avancés
CREATE TABLE IF NOT EXISTS public.freight_employees_extended (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forwarder_id UUID NOT NULL REFERENCES public.freight_forwarder_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_code TEXT UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('manager', 'operator', 'scanner', 'driver', 'customs_agent', 'customer_service')),
  permissions JSONB DEFAULT '{}',
  assigned_warehouses UUID[] DEFAULT ARRAY[]::UUID[],
  assigned_routes TEXT[] DEFAULT ARRAY[]::TEXT[],
  access_level INTEGER DEFAULT 1, -- 1-5 access levels
  is_active BOOLEAN DEFAULT true,
  hired_at TIMESTAMPTZ DEFAULT now(),
  last_activity TIMESTAMPTZ,
  performance_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table avancée pour les expéditions internationales
CREATE TABLE IF NOT EXISTS public.shipments_international_extended (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_code TEXT UNIQUE NOT NULL,
  forwarder_id UUID NOT NULL REFERENCES public.freight_forwarder_profiles(id),
  customer_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Informations expéditeur
  sender_name TEXT NOT NULL,
  sender_company TEXT,
  sender_address TEXT NOT NULL,
  sender_city TEXT NOT NULL,
  sender_country TEXT NOT NULL,
  sender_phone TEXT NOT NULL,
  sender_email TEXT,
  
  -- Informations destinataire
  recipient_name TEXT NOT NULL,
  recipient_company TEXT,
  recipient_address TEXT NOT NULL,
  recipient_city TEXT NOT NULL,
  recipient_country TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  recipient_email TEXT,
  
  -- Détails du colis
  cargo_type TEXT NOT NULL DEFAULT 'general',
  description TEXT NOT NULL,
  weight_kg NUMERIC NOT NULL,
  volume_m3 NUMERIC,
  dimensions JSONB, -- {length, width, height}
  declared_value_usd NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  
  -- Service et livraison
  service_type TEXT NOT NULL DEFAULT 'standard',
  priority INTEGER DEFAULT 1, -- 1=standard, 2=express, 3=urgent, 4=same_day, 5=special
  transport_mode TEXT DEFAULT 'air', -- air, sea, road, rail, combined
  incoterm TEXT DEFAULT 'EXW',
  
  -- Dates et délais
  pickup_date DATE,
  estimated_delivery DATE,
  actual_pickup_date TIMESTAMPTZ,
  actual_delivery_date TIMESTAMPTZ,
  
  -- Statut et suivi
  status TEXT DEFAULT 'created' CHECK (status IN ('created', 'confirmed', 'picked_up', 'in_warehouse', 'customs_processing', 'in_transit', 'customs_cleared', 'out_for_delivery', 'delivered', 'exception', 'cancelled')),
  current_location TEXT,
  current_warehouse_id UUID REFERENCES public.freight_warehouses_extended(id),
  
  -- Tarification
  base_price NUMERIC DEFAULT 0,
  fuel_surcharge NUMERIC DEFAULT 0,
  insurance_fee NUMERIC DEFAULT 0,
  customs_fee NUMERIC DEFAULT 0,
  handling_fee NUMERIC DEFAULT 0,
  total_price NUMERIC DEFAULT 0,
  
  -- Assurance et sécurité
  insurance_amount NUMERIC DEFAULT 0,
  insurance_type TEXT DEFAULT 'basic',
  is_dangerous BOOLEAN DEFAULT false,
  is_perishable BOOLEAN DEFAULT false,
  is_valuable BOOLEAN DEFAULT false,
  security_level INTEGER DEFAULT 1,
  
  -- Instructions spéciales
  special_instructions TEXT,
  delivery_instructions TEXT,
  customs_instructions TEXT,
  
  -- Suivi et notifications
  tracking_notifications JSONB DEFAULT '[]',
  customer_notifications_enabled BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  email_notifications BOOLEAN DEFAULT true,
  
  -- Métadonnées
  qr_code TEXT,
  barcode TEXT,
  reference_number TEXT,
  customer_reference TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table pour le suivi détaillé des colis
CREATE TABLE IF NOT EXISTS public.shipment_tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES public.shipments_international_extended(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_description TEXT NOT NULL,
  location TEXT,
  warehouse_id UUID REFERENCES public.freight_warehouses_extended(id),
  employee_id UUID REFERENCES public.freight_employees_extended(id),
  latitude NUMERIC,
  longitude NUMERIC,
  event_timestamp TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table pour les documents douaniers
CREATE TABLE IF NOT EXISTS public.customs_documents_extended (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES public.shipments_international_extended(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('commercial_invoice', 'packing_list', 'certificate_of_origin', 'import_license', 'export_license', 'insurance_certificate', 'other')),
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  is_required BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES public.freight_employees_extended(id),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table pour les tarifs et zones
CREATE TABLE IF NOT EXISTS public.freight_rates_extended (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forwarder_id UUID NOT NULL REFERENCES public.freight_forwarder_profiles(id) ON DELETE CASCADE,
  origin_country TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  transport_mode TEXT NOT NULL,
  service_type TEXT NOT NULL,
  cargo_type TEXT DEFAULT 'general',
  weight_from_kg NUMERIC DEFAULT 0,
  weight_to_kg NUMERIC DEFAULT 999999,
  base_rate_per_kg NUMERIC NOT NULL,
  base_rate_per_m3 NUMERIC,
  minimum_charge NUMERIC NOT NULL,
  fuel_surcharge_percentage NUMERIC DEFAULT 0,
  insurance_rate_percentage NUMERIC DEFAULT 0.1,
  handling_fee NUMERIC DEFAULT 0,
  customs_clearance_fee NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  valid_from DATE NOT NULL,
  valid_until DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table pour les réclamations clients
CREATE TABLE IF NOT EXISTS public.customer_claims_extended (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number TEXT UNIQUE NOT NULL,
  shipment_id UUID NOT NULL REFERENCES public.shipments_international_extended(id),
  customer_id UUID NOT NULL REFERENCES auth.users(id),
  forwarder_id UUID NOT NULL REFERENCES public.freight_forwarder_profiles(id),
  claim_type TEXT NOT NULL CHECK (claim_type IN ('damage', 'loss', 'delay', 'service_quality', 'billing', 'other')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  claimed_amount NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  evidence_files JSONB DEFAULT '[]',
  priority INTEGER DEFAULT 1, -- 1=low, 2=medium, 3=high, 4=urgent
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'pending_response', 'resolved', 'closed', 'escalated')),
  assigned_to UUID REFERENCES public.freight_employees_extended(id),
  resolution_notes TEXT,
  compensation_amount NUMERIC DEFAULT 0,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_shipments_international_tracking_code ON public.shipments_international_extended(tracking_code);
CREATE INDEX IF NOT EXISTS idx_shipments_international_forwarder ON public.shipments_international_extended(forwarder_id);
CREATE INDEX IF NOT EXISTS idx_shipments_international_customer ON public.shipments_international_extended(customer_id);
CREATE INDEX IF NOT EXISTS idx_shipments_international_status ON public.shipments_international_extended(status);
CREATE INDEX IF NOT EXISTS idx_shipment_tracking_events_shipment ON public.shipment_tracking_events(shipment_id);
CREATE INDEX IF NOT EXISTS idx_freight_employees_forwarder ON public.freight_employees_extended(forwarder_id);
CREATE INDEX IF NOT EXISTS idx_freight_warehouses_forwarder ON public.freight_warehouses_extended(forwarder_id);

-- Fonctions pour générer les codes automatiquement
CREATE OR REPLACE FUNCTION generate_tracking_code_international()
RETURNS TEXT AS $$
DECLARE
  tracking_code TEXT;
  is_unique BOOLEAN := FALSE;
BEGIN
  WHILE NOT is_unique LOOP
    tracking_code := 'INTL-' || LPAD(floor(random() * 10000000)::TEXT, 7, '0');
    SELECT NOT EXISTS(SELECT 1 FROM public.shipments_international_extended WHERE tracking_code = tracking_code) INTO is_unique;
  END LOOP;
  RETURN tracking_code;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_employee_code(forwarder_id UUID)
RETURNS TEXT AS $$
DECLARE
  employee_code TEXT;
  company_prefix TEXT;
  counter INTEGER;
BEGIN
  -- Get company prefix from forwarder profile
  SELECT UPPER(LEFT(company_name, 3)) INTO company_prefix
  FROM public.freight_forwarder_profiles 
  WHERE id = forwarder_id;
  
  -- Get next counter
  SELECT COALESCE(MAX(CAST(RIGHT(employee_code, 4) AS INTEGER)), 0) + 1 
  INTO counter
  FROM public.freight_employees_extended 
  WHERE forwarder_id = generate_employee_code.forwarder_id;
  
  employee_code := company_prefix || '-EMP-' || LPAD(counter::TEXT, 4, '0');
  
  RETURN employee_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour les codes automatiques
CREATE OR REPLACE FUNCTION set_tracking_code_international()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracking_code IS NULL OR NEW.tracking_code = '' THEN
    NEW.tracking_code := generate_tracking_code_international();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_tracking_code_international
  BEFORE INSERT ON public.shipments_international_extended
  FOR EACH ROW
  EXECUTE FUNCTION set_tracking_code_international();

-- Trigger pour les timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_freight_forwarder_profiles_updated_at
  BEFORE UPDATE ON public.freight_forwarder_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_freight_warehouses_extended_updated_at
  BEFORE UPDATE ON public.freight_warehouses_extended
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_freight_employees_extended_updated_at
  BEFORE UPDATE ON public.freight_employees_extended
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_shipments_international_extended_updated_at
  BEFORE UPDATE ON public.shipments_international_extended
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Séquence pour les numéros de réclamation
CREATE SEQUENCE IF NOT EXISTS claim_number_seq START 1000;

CREATE OR REPLACE FUNCTION generate_claim_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'CLM-' || LPAD(nextval('claim_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_claim_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.claim_number IS NULL OR NEW.claim_number = '' THEN
    NEW.claim_number := generate_claim_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_claim_number
  BEFORE INSERT ON public.customer_claims_extended
  FOR EACH ROW
  EXECUTE FUNCTION set_claim_number();