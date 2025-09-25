-- Créer une table pour les boutiques des vendeurs
CREATE TABLE public.seller_shops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL,
  shop_name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  theme_color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  custom_domain TEXT,
  social_links JSONB DEFAULT '{}',
  business_hours JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ajouter des colonnes aux produits pour la mise en avant
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Activer RLS sur la table des boutiques
ALTER TABLE public.seller_shops ENABLE ROW LEVEL SECURITY;

-- Créer des policies pour les boutiques
CREATE POLICY "Vendeurs peuvent gérer leur boutique" 
ON public.seller_shops 
FOR ALL 
USING (auth.uid() = seller_id);

CREATE POLICY "Boutiques publiques visibles par tous" 
ON public.seller_shops 
FOR SELECT 
USING (is_active = true);

-- Créer un trigger pour mettre à jour updated_at
CREATE TRIGGER update_seller_shops_updated_at
BEFORE UPDATE ON public.seller_shops
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();