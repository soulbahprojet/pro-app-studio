-- Créer la table pour les badges du syndicat
CREATE TABLE public.union_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  courier_id TEXT NOT NULL,
  badge_number TEXT NOT NULL UNIQUE,
  vest_number TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  photo_url TEXT,
  bureau_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table pour les tickets de taxe routière
CREATE TABLE public.road_tax_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  courier_id TEXT NOT NULL,
  ticket_number TEXT NOT NULL UNIQUE,
  vehicle_number TEXT NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GNF',
  bureau_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur les tables
ALTER TABLE public.union_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.road_tax_tickets ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour union_badges
CREATE POLICY "Union staff can manage badges" 
ON public.union_badges 
FOR ALL 
USING (true);

-- Créer les politiques RLS pour road_tax_tickets  
CREATE POLICY "Union staff can manage tickets"
ON public.road_tax_tickets
FOR ALL
USING (true);

-- Ajouter des déclencheurs pour updated_at
CREATE TRIGGER update_union_badges_updated_at
  BEFORE UPDATE ON public.union_badges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_road_tax_tickets_updated_at
  BEFORE UPDATE ON public.road_tax_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();