-- Ajout des colonnes pour les quotas de stockage et la gestion avancée
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS storage_used_gb NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS storage_quota_gb NUMERIC DEFAULT 2,
ADD COLUMN IF NOT EXISTS pos_settings JSONB DEFAULT '{"offline_mode": true, "auto_sync": true, "low_stock_alert": 10}'::jsonb;

-- Table pour stocker les données hors ligne
CREATE TABLE IF NOT EXISTS public.offline_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id),
  sale_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  synced_at TIMESTAMPTZ,
  is_synced BOOLEAN DEFAULT false
);

-- Table pour les alertes de stock faible
CREATE TABLE IF NOT EXISTS public.stock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id),
  alert_type TEXT NOT NULL DEFAULT 'low_stock',
  threshold INTEGER NOT NULL DEFAULT 10,
  current_stock INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Table pour les promotions POS
CREATE TABLE IF NOT EXISTS public.pos_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'percentage', -- percentage, fixed_amount, buy_x_get_y
  value NUMERIC NOT NULL,
  min_amount NUMERIC DEFAULT 0,
  max_discount NUMERIC,
  applicable_products UUID[] DEFAULT '{}',
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  max_usage INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table pour les sessions POS
CREATE TABLE IF NOT EXISTS public.pos_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  opening_cash NUMERIC DEFAULT 0,
  closing_cash NUMERIC,
  total_sales NUMERIC DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  notes TEXT
);

-- RLS Policies
ALTER TABLE public.offline_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_sessions ENABLE ROW LEVEL SECURITY;

-- Policies pour offline_sales
CREATE POLICY "Sellers can manage their offline sales" ON public.offline_sales
FOR ALL USING (auth.uid() = seller_id);

-- Policies pour stock_alerts
CREATE POLICY "Sellers can view their stock alerts" ON public.stock_alerts
FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "System can manage stock alerts" ON public.stock_alerts
FOR ALL USING (true);

-- Policies pour pos_promotions
CREATE POLICY "Sellers can manage their POS promotions" ON public.pos_promotions
FOR ALL USING (auth.uid() = seller_id);

-- Policies pour pos_sessions
CREATE POLICY "Sellers can manage their POS sessions" ON public.pos_sessions
FOR ALL USING (auth.uid() = seller_id);

-- Fonction pour calculer l'utilisation du stockage
CREATE OR REPLACE FUNCTION public.calculate_storage_usage(user_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_size NUMERIC := 0;
  product_images_size NUMERIC := 0;
BEGIN
  -- Calculer la taille des images de produits (estimation basée sur le nombre d'images)
  SELECT COALESCE(SUM(array_length(images, 1)) * 0.5, 0) INTO product_images_size
  FROM public.products 
  WHERE seller_id = user_id;
  
  total_size := product_images_size;
  
  RETURN ROUND(total_size, 2);
END;
$$;

-- Fonction pour vérifier les alertes de stock
CREATE OR REPLACE FUNCTION public.check_stock_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insérer de nouvelles alertes pour les produits en stock faible
  INSERT INTO public.stock_alerts (product_id, seller_id, current_stock, threshold)
  SELECT 
    p.id,
    p.seller_id,
    p.stock_quantity,
    COALESCE((pr.pos_settings->>'low_stock_alert')::integer, 10)
  FROM public.products p
  LEFT JOIN public.profiles pr ON pr.user_id = p.seller_id
  WHERE p.stock_quantity <= COALESCE((pr.pos_settings->>'low_stock_alert')::integer, 10)
    AND p.stock_quantity > 0
    AND NOT EXISTS (
      SELECT 1 FROM public.stock_alerts sa 
      WHERE sa.product_id = p.id 
        AND sa.is_active = true
    );
    
  -- Résoudre les alertes pour les produits qui ont été réapprovisionnés
  UPDATE public.stock_alerts 
  SET is_active = false, resolved_at = now()
  WHERE is_active = true
    AND product_id IN (
      SELECT p.id FROM public.products p
      JOIN public.profiles pr ON pr.user_id = p.seller_id
      WHERE p.stock_quantity > COALESCE((pr.pos_settings->>'low_stock_alert')::integer, 10)
    );
END;
$$;

-- Trigger pour mettre à jour l'utilisation du stockage
CREATE OR REPLACE FUNCTION public.update_storage_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.profiles 
  SET storage_used_gb = public.calculate_storage_usage(NEW.seller_id)
  WHERE user_id = NEW.seller_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_storage_on_product_change
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_storage_usage();