-- Amélioration du système de boutique numérique
-- Tables pour les boutiques multiples
CREATE TABLE IF NOT EXISTS public.digital_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  slug TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table pour les catégories de produits numériques
CREATE TABLE IF NOT EXISTS public.digital_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES public.digital_shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Amélioration de la table products pour le numérique
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.digital_shops(id),
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.digital_categories(id),
ADD COLUMN IF NOT EXISTS auto_delivery_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS delivery_instructions TEXT,
ADD COLUMN IF NOT EXISTS marketing_tags TEXT[],
ADD COLUMN IF NOT EXISTS seo_keywords TEXT[],
ADD COLUMN IF NOT EXISTS promotion_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS promotion_discount NUMERIC,
ADD COLUMN IF NOT EXISTS promotion_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ai_generated_content JSONB DEFAULT '{}';

-- Table pour l'historique des ventes
CREATE TABLE IF NOT EXISTS public.digital_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id),
  customer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'GNF',
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table pour les codes promotionnels
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.digital_shops(id),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL,
  min_amount NUMERIC DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table pour le suivi des performances
CREATE TABLE IF NOT EXISTS public.shop_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.digital_shops(id),
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  sales INTEGER DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'GNF',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(shop_id, date)
);

-- RLS Policies
ALTER TABLE public.digital_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_analytics ENABLE ROW LEVEL SECURITY;

-- Policies pour digital_shops
CREATE POLICY "Users can manage their shops" ON public.digital_shops
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active shops" ON public.digital_shops
  FOR SELECT USING (is_active = true);

-- Policies pour digital_categories
CREATE POLICY "Shop owners can manage categories" ON public.digital_categories
  FOR ALL USING (shop_id IN (SELECT id FROM public.digital_shops WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can view categories" ON public.digital_categories
  FOR SELECT USING (is_active = true);

-- Policies pour digital_sales
CREATE POLICY "Sellers can view their sales" ON public.digital_sales
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Customers can view their purchases" ON public.digital_sales
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "System can insert sales" ON public.digital_sales
  FOR INSERT WITH CHECK (true);

-- Policies pour promo_codes
CREATE POLICY "Shop owners can manage promo codes" ON public.promo_codes
  FOR ALL USING (shop_id IN (SELECT id FROM public.digital_shops WHERE user_id = auth.uid()));

-- Policies pour shop_analytics
CREATE POLICY "Shop owners can view analytics" ON public.shop_analytics
  FOR ALL USING (shop_id IN (SELECT id FROM public.digital_shops WHERE user_id = auth.uid()));

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_digital_shops_updated_at
  BEFORE UPDATE ON public.digital_shops
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_digital_shops_user_id ON public.digital_shops(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_shops_slug ON public.digital_shops(slug);
CREATE INDEX IF NOT EXISTS idx_digital_categories_shop_id ON public.digital_categories(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON public.products(shop_id);
CREATE INDEX IF NOT EXISTS idx_digital_sales_seller_id ON public.digital_sales(seller_id);
CREATE INDEX IF NOT EXISTS idx_digital_sales_customer_id ON public.digital_sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_shop_analytics_shop_date ON public.shop_analytics(shop_id, date);