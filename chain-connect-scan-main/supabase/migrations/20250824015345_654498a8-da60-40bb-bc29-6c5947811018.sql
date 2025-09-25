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

-- Activer RLS sur les nouvelles tables
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.id_transfers ENABLE ROW LEVEL SECURITY;