-- Créer la table warehouses si elle n'existe pas déjà
CREATE TABLE IF NOT EXISTS public.warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'GN',
  postal_code TEXT,
  contact_person TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  capacity_m3 NUMERIC DEFAULT 1000,
  current_occupancy_m3 NUMERIC DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;

-- Politique pour que les vendeurs gèrent leurs propres entrepôts
CREATE POLICY "Sellers can manage their own warehouses"
ON public.warehouses
FOR ALL
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

-- Politique pour que tous les utilisateurs authentifiés puissent voir les entrepôts actifs
CREATE POLICY "Sellers can view their own warehouses"
ON public.warehouses
FOR SELECT
USING (auth.uid() = seller_id);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_warehouses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_warehouses_updated_at_trigger
  BEFORE UPDATE ON public.warehouses
  FOR EACH ROW
  EXECUTE FUNCTION update_warehouses_updated_at();