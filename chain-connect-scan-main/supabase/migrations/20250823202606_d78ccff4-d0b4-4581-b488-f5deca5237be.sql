-- Créer la table des expéditions internationales
CREATE TABLE public.shipments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  destination TEXT NOT NULL,
  origin TEXT NOT NULL,
  weight NUMERIC(10,2) NOT NULL,
  dimensions JSONB NOT NULL DEFAULT '{"length":0,"height":0,"width":0}'::jsonb,
  service_type TEXT NOT NULL CHECK (service_type IN ('Standard', 'Express', 'Priority')),
  status TEXT NOT NULL DEFAULT 'Créé' CHECK (status IN ('Créé', 'En transit', 'Livré', 'Annulé')),
  tracking_code TEXT NOT NULL UNIQUE,
  price NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table de l'historique de suivi
CREATE TABLE public.shipment_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shipment_id UUID NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer les index pour les performances
CREATE INDEX idx_shipments_user_id ON public.shipments(user_id);
CREATE INDEX idx_shipments_tracking_code ON public.shipments(tracking_code);
CREATE INDEX idx_shipments_status ON public.shipments(status);
CREATE INDEX idx_shipment_tracking_shipment_id ON public.shipment_tracking(shipment_id);

-- Ajouter les clés étrangères
ALTER TABLE public.shipment_tracking ADD CONSTRAINT fk_shipment_tracking_shipment 
  FOREIGN KEY (shipment_id) REFERENCES public.shipments(id) ON DELETE CASCADE;

-- Fonction pour générer un code de suivi unique
CREATE OR REPLACE FUNCTION generate_tracking_code() 
RETURNS TEXT AS $$
DECLARE
  tracking_code TEXT;
  is_unique BOOLEAN := FALSE;
BEGIN
  WHILE NOT is_unique LOOP
    tracking_code := 'TRK-' || LPAD(floor(random() * 1000000)::TEXT, 7, '0');
    SELECT NOT EXISTS(SELECT 1 FROM shipments WHERE tracking_code = tracking_code) INTO is_unique;
  END LOOP;
  RETURN tracking_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement le code de suivi
CREATE OR REPLACE FUNCTION set_tracking_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracking_code IS NULL OR NEW.tracking_code = '' THEN
    NEW.tracking_code := generate_tracking_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_tracking_code
  BEFORE INSERT ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION set_tracking_code();

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_shipment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_shipment_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION update_shipment_updated_at();

-- Activer Row Level Security
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_tracking ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour shipments
CREATE POLICY "Users can view their own shipments" 
ON public.shipments FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shipments" 
ON public.shipments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shipments" 
ON public.shipments FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Transitaires can view all shipments" 
ON public.shipments FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('transitaire', 'admin')
  )
);

CREATE POLICY "Transitaires can update all shipments" 
ON public.shipments FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('transitaire', 'admin')
  )
);

-- Politiques RLS pour shipment_tracking
CREATE POLICY "Users can view tracking of their shipments" 
ON public.shipment_tracking FOR SELECT 
USING (
  shipment_id IN (
    SELECT id FROM shipments WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Transitaires can view all tracking" 
ON public.shipment_tracking FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('transitaire', 'admin')
  )
);

CREATE POLICY "Transitaires can create tracking entries" 
ON public.shipment_tracking FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('transitaire', 'admin')
  )
);

CREATE POLICY "System can create tracking entries" 
ON public.shipment_tracking FOR INSERT 
WITH CHECK (true);