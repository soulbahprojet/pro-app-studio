-- Créer les types d'énumération pour les tickets et badges
CREATE TYPE ticket_status AS ENUM ('pending', 'in_progress', 'resolved');
CREATE TYPE ticket_type AS ENUM ('incident', 'delay', 'breakdown', 'dispute', 'other');
CREATE TYPE badge_type AS ENUM ('speed', 'reliability', 'missions', 'excellence', 'veteran');

-- Ajouter des colonnes au profil pour la ville et le numéro de gilet
ALTER TABLE public.profiles 
ADD COLUMN city text,
ADD COLUMN vest_number integer UNIQUE,
ADD COLUMN total_missions integer DEFAULT 0,
ADD COLUMN completed_missions integer DEFAULT 0,
ADD COLUMN success_rate numeric DEFAULT 0.0,
ADD COLUMN average_rating numeric DEFAULT 0.0;

-- Créer la table des tickets
CREATE TABLE public.tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  courier_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  union_id uuid REFERENCES unions(id) ON DELETE SET NULL,
  ticket_number text NOT NULL UNIQUE,
  type ticket_type NOT NULL,
  status ticket_status DEFAULT 'pending',
  title text NOT NULL,
  description text NOT NULL,
  photo_url text,
  gps_latitude numeric,
  gps_longitude numeric,
  gps_location text,
  priority integer DEFAULT 1,
  assigned_to uuid REFERENCES profiles(user_id) ON DELETE SET NULL,
  resolved_at timestamp with time zone,
  resolution_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Créer la table des badges
CREATE TABLE public.badges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  courier_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  badge_type badge_type NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  color text DEFAULT '#3B82F6',
  criteria_met jsonb DEFAULT '{}',
  earned_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(courier_id, badge_type)
);

-- Créer la table des transferts d'ID
CREATE TABLE public.id_transfers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  courier_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  from_union_id uuid REFERENCES unions(id) ON DELETE SET NULL,
  to_union_id uuid REFERENCES unions(id) ON DELETE SET NULL,
  from_city text NOT NULL,
  to_city text NOT NULL,
  reason text,
  status text DEFAULT 'pending',
  requested_at timestamp with time zone DEFAULT now(),
  approved_at timestamp with time zone,
  completed_at timestamp with time zone,
  notes text
);

-- Créer la séquence pour les numéros de gilet
CREATE SEQUENCE vest_number_seq START 1001;

-- Créer la séquence pour les numéros de ticket
CREATE SEQUENCE ticket_number_seq START 1;

-- Fonction pour générer un numéro de ticket
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  ticket_num TEXT;
BEGIN
  ticket_num := 'TKT-' || LPAD(nextval('ticket_number_seq')::TEXT, 6, '0');
  RETURN ticket_num;
END;
$$;

-- Fonction pour attribuer un numéro de gilet automatiquement
CREATE OR REPLACE FUNCTION assign_vest_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.role = 'courier' AND NEW.vest_number IS NULL THEN
    NEW.vest_number := nextval('vest_number_seq');
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger pour attribuer un numéro de gilet automatiquement
CREATE TRIGGER assign_vest_number_trigger
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION assign_vest_number();

-- Trigger pour définir le numéro de ticket automatiquement
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_ticket_number_trigger
BEFORE INSERT ON tickets
FOR EACH ROW EXECUTE FUNCTION set_ticket_number();

-- Fonction pour attribuer automatiquement des badges
CREATE OR REPLACE FUNCTION check_and_assign_badges(p_courier_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
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
    VALUES (p_courier_id, 'excellence', 'Excellence', 'Livreur d\'excellence', '💎', '#EF4444')
    ON CONFLICT (courier_id, badge_type) DO NOTHING;
  END IF;

  -- Badge Vétéran (500+ missions)
  IF courier_stats.completed_missions >= 500 THEN
    INSERT INTO badges (courier_id, badge_type, name, description, icon, color)
    VALUES (p_courier_id, 'veteran', 'Vétéran', 'Maître de la livraison', '👑', '#DC2626')
    ON CONFLICT (courier_id, badge_type) DO NOTHING;
  END IF;
END;
$$;

-- Activer RLS sur les nouvelles tables
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.id_transfers ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour tickets
CREATE POLICY "Couriers can manage their tickets" 
ON public.tickets 
FOR ALL 
USING (auth.uid() = courier_id);

CREATE POLICY "Union leaders can view their members tickets" 
ON public.tickets 
FOR SELECT 
USING (
  union_id IN (
    SELECT id FROM unions WHERE leader_id = auth.uid()
  )
);

CREATE POLICY "Union leaders can update tickets status" 
ON public.tickets 
FOR UPDATE 
USING (
  union_id IN (
    SELECT id FROM unions WHERE leader_id = auth.uid()
  )
);

-- Politiques RLS pour badges
CREATE POLICY "Users can view their badges" 
ON public.badges 
FOR SELECT 
USING (auth.uid() = courier_id);

CREATE POLICY "System can manage badges" 
ON public.badges 
FOR ALL 
USING (true);

-- Politiques RLS pour transferts
CREATE POLICY "Couriers can view their transfers" 
ON public.id_transfers 
FOR SELECT 
USING (auth.uid() = courier_id);

CREATE POLICY "Couriers can request transfers" 
ON public.id_transfers 
FOR INSERT 
WITH CHECK (auth.uid() = courier_id);

CREATE POLICY "Union leaders can manage transfers" 
ON public.id_transfers 
FOR ALL 
USING (
  from_union_id IN (SELECT id FROM unions WHERE leader_id = auth.uid()) OR
  to_union_id IN (SELECT id FROM unions WHERE leader_id = auth.uid())
);