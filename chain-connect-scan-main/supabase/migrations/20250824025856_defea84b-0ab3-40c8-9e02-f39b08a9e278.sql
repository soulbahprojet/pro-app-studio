-- Mise à jour des tables pour la gestion avancée des livreurs

-- Table des tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number TEXT NOT NULL DEFAULT generate_ticket_number(),
  courier_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'incident',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  photo_url TEXT,
  gps_latitude NUMERIC,
  gps_longitude NUMERIC,
  location_description TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des badges avec nouveaux types
ALTER TABLE public.badges ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE public.badges ADD COLUMN IF NOT EXISTS requirements JSONB DEFAULT '{}';

-- Séquence pour les numéros de ticket
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START 1;

-- Fonction pour générer les numéros de ticket
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
  ticket_num TEXT;
BEGIN
  ticket_num := 'TKT-' || LPAD(nextval('ticket_number_seq')::TEXT, 6, '0');
  RETURN ticket_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour les numéros de ticket
CREATE OR REPLACE FUNCTION public.set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_ticket_number_trigger ON public.support_tickets;
CREATE TRIGGER set_ticket_number_trigger
  BEFORE INSERT ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_number();

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Table des transferts d'ID entre syndicats
CREATE TABLE IF NOT EXISTS public.id_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  courier_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_union_id UUID REFERENCES public.unions(id),
  to_union_id UUID REFERENCES public.unions(id),
  from_city TEXT NOT NULL,
  to_city TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Ajout du numéro de gilet dans les profils (déjà fait mais on s'assure)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS vest_number INTEGER;

-- Fonction pour attribuer automatiquement les numéros de gilet
CREATE OR REPLACE FUNCTION public.assign_vest_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Only assign vest number for couriers if not already set
  IF NEW.role = 'courier' AND (OLD.vest_number IS NULL OR NEW.vest_number IS NULL) THEN
    -- Get the next available vest number starting from 1001
    SELECT COALESCE(MAX(vest_number), 1000) + 1 
    INTO NEW.vest_number 
    FROM public.profiles 
    WHERE role = 'courier';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour l'attribution automatique des numéros de gilet
DROP TRIGGER IF EXISTS assign_vest_number_trigger ON public.profiles;
CREATE TRIGGER assign_vest_number_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_vest_number();

-- Mise à jour des unions pour ajouter la ville
ALTER TABLE public.unions ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.unions ADD COLUMN IF NOT EXISTS region TEXT;

-- Ajout de la ville obligatoire dans les profils pour les livreurs
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;

-- Fonction pour vérifier et attribuer les badges automatiquement
CREATE OR REPLACE FUNCTION public.check_and_assign_badges(p_courier_id UUID)
RETURNS VOID AS $$
DECLARE
  courier_stats RECORD;
BEGIN
  -- Récupérer les statistiques du livreur
  SELECT 
    total_missions,
    completed_missions,
    success_rate,
    average_rating
  INTO courier_stats
  FROM profiles
  WHERE user_id = p_courier_id;

  -- Badge Rapidité (10+ missions avec taux de succès > 95%)
  IF courier_stats.total_missions >= 10 AND courier_stats.success_rate >= 95.0 THEN
    INSERT INTO badges (courier_id, badge_type, name, description, icon, color)
    VALUES (p_courier_id, 'speed', 'Éclair', 'Livreur ultra-rapide', '⚡', '#F59E0B')
    ON CONFLICT (courier_id, badge_type) DO NOTHING;
  END IF;

  -- Badge Fiabilité (20+ missions avec note moyenne > 4.5)
  IF courier_stats.total_missions >= 20 AND courier_stats.average_rating >= 4.5 THEN
    INSERT INTO badges (courier_id, badge_type, name, description, icon, color)
    VALUES (p_courier_id, 'reliability', 'Fiable', 'Livreur de confiance', '🛡️', '#10B981')
    ON CONFLICT (courier_id, badge_type) DO NOTHING;
  END IF;

  -- Badge Missions (50+ missions complétées)
  IF courier_stats.completed_missions >= 50 THEN
    INSERT INTO badges (courier_id, badge_type, name, description, icon, color)
    VALUES (p_courier_id, 'missions', 'Expert', 'Professionnel expérimenté', '🏆', '#8B5CF6')
    ON CONFLICT (courier_id, badge_type) DO NOTHING;
  END IF;

  -- Badge Excellence (100+ missions, 98%+ succès, 4.8+ note)
  IF courier_stats.total_missions >= 100 AND 
     courier_stats.success_rate >= 98.0 AND 
     courier_stats.average_rating >= 4.8 THEN
    INSERT INTO badges (courier_id, badge_type, name, description, icon, color)
    VALUES (p_courier_id, 'excellence', 'Excellence', 'Livreur d''excellence', '💎', '#EF4444')
    ON CONFLICT (courier_id, badge_type) DO NOTHING;
  END IF;

  -- Badge Vétéran (500+ missions)
  IF courier_stats.completed_missions >= 500 THEN
    INSERT INTO badges (courier_id, badge_type, name, description, icon, color)
    VALUES (p_courier_id, 'veteran', 'Vétéran', 'Maître de la livraison', '👑', '#DC2626')
    ON CONFLICT (courier_id, badge_type) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RLS pour les tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couriers can create tickets" ON public.support_tickets
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = courier_id);

CREATE POLICY "Couriers can view their tickets" ON public.support_tickets
FOR SELECT TO authenticated
USING (auth.uid() = courier_id);

CREATE POLICY "Union leaders can view tickets" ON public.support_tickets
FOR SELECT TO authenticated
USING (
  courier_id IN (
    SELECT um.courier_id 
    FROM union_members um
    JOIN unions u ON u.id = um.union_id
    WHERE u.leader_id = auth.uid() AND um.is_active = true
  )
);

CREATE POLICY "Union leaders can update tickets" ON public.support_tickets
FOR UPDATE TO authenticated
USING (
  courier_id IN (
    SELECT um.courier_id 
    FROM union_members um
    JOIN unions u ON u.id = um.union_id
    WHERE u.leader_id = auth.uid() AND um.is_active = true
  )
);

-- RLS pour les transferts
ALTER TABLE public.id_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couriers can request transfers" ON public.id_transfers
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = courier_id);

CREATE POLICY "Couriers can view their transfers" ON public.id_transfers
FOR SELECT TO authenticated
USING (auth.uid() = courier_id);

CREATE POLICY "Union leaders can manage transfers" ON public.id_transfers
FOR ALL TO authenticated
USING (
  from_union_id IN (SELECT id FROM unions WHERE leader_id = auth.uid()) OR
  to_union_id IN (SELECT id FROM unions WHERE leader_id = auth.uid())
);