-- Ajouter les types d'énumération pour véhicules et syndicats
CREATE TYPE vehicle_type AS ENUM ('moto', 'voiture');
CREATE TYPE union_type AS ENUM ('syndicat_moto', 'syndicat_voiture');

-- Ajouter les colonnes nécessaires au profil
ALTER TABLE public.profiles 
ADD COLUMN vehicle_type vehicle_type,
ADD COLUMN union_type union_type,
ADD COLUMN gps_verified boolean DEFAULT false,
ADD COLUMN gps_country text,
ADD COLUMN last_gps_check timestamp with time zone;

-- Créer la table pour les syndicats
CREATE TABLE public.unions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  leader_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  union_type union_type NOT NULL,
  name text NOT NULL,
  country text NOT NULL,
  gps_verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  member_count integer DEFAULT 0
);

-- Créer la table pour l'affiliation des livreurs aux syndicats
CREATE TABLE public.union_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  union_id uuid NOT NULL REFERENCES unions(id) ON DELETE CASCADE,
  courier_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  joined_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(courier_id) -- Un livreur ne peut être que dans un seul syndicat
);

-- Activer RLS sur les nouvelles tables
ALTER TABLE public.unions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.union_members ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour unions
CREATE POLICY "Union leaders can manage their union" 
ON public.unions 
FOR ALL 
USING (auth.uid() = leader_id);

CREATE POLICY "Couriers can view unions in their country" 
ON public.unions 
FOR SELECT 
USING (
  is_active = true AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'courier'::user_role 
    AND country = unions.country
  )
);

-- Politiques RLS pour union_members
CREATE POLICY "Union leaders can manage their members" 
ON public.union_members 
FOR ALL 
USING (
  union_id IN (
    SELECT id FROM unions WHERE leader_id = auth.uid()
  )
);

CREATE POLICY "Couriers can view their membership" 
ON public.union_members 
FOR SELECT 
USING (auth.uid() = courier_id);

-- Fonction pour mettre à jour le nombre de membres
CREATE OR REPLACE FUNCTION update_union_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.is_active = true THEN
    UPDATE unions 
    SET member_count = member_count + 1 
    WHERE id = NEW.union_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_active = false AND NEW.is_active = true THEN
      UPDATE unions 
      SET member_count = member_count + 1 
      WHERE id = NEW.union_id;
    ELSIF OLD.is_active = true AND NEW.is_active = false THEN
      UPDATE unions 
      SET member_count = member_count - 1 
      WHERE id = NEW.union_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.is_active = true THEN
    UPDATE unions 
    SET member_count = member_count - 1 
    WHERE id = OLD.union_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger pour maintenir le compteur de membres
CREATE TRIGGER update_union_member_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON union_members
FOR EACH ROW EXECUTE FUNCTION update_union_member_count();