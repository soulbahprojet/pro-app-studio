-- Update subscription plans enum to match the specification
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'basic';
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'standard';
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'premium';

-- Add subscription plan to seller_shops table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='seller_shops' AND column_name='subscription_plan') THEN
        ALTER TABLE seller_shops ADD COLUMN subscription_plan subscription_plan DEFAULT 'basic';
    END IF;
END $$;

-- Add product limit tracking
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='seller_shops' AND column_name='product_count') THEN
        ALTER TABLE seller_shops ADD COLUMN product_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create promotions table for Standard/Premium features
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES seller_shops(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')) DEFAULT 'percentage',
  discount_value NUMERIC NOT NULL,
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('active', 'expired', 'inactive')) DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(shop_id, code)
);

-- Enable RLS on promotions
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Create policies for promotions
CREATE POLICY "Sellers can manage their shop promotions" ON public.promotions
FOR ALL USING (shop_id IN (SELECT id FROM seller_shops WHERE seller_id = auth.uid()));

-- Create shop_analytics table for tracking views and stats
CREATE TABLE IF NOT EXISTS public.shop_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES seller_shops(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER DEFAULT 0,
  orders INTEGER DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  currency currency_type DEFAULT 'GNF',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(shop_id, date)
);

-- Enable RLS on shop_analytics
ALTER TABLE public.shop_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for shop_analytics
CREATE POLICY "Sellers can view their shop analytics" ON public.shop_analytics
FOR SELECT USING (shop_id IN (SELECT id FROM seller_shops WHERE seller_id = auth.uid()));

CREATE POLICY "System can manage shop analytics" ON public.shop_analytics
FOR ALL USING (true);

-- Add slug column to seller_shops if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='seller_shops' AND column_name='slug') THEN
        ALTER TABLE seller_shops ADD COLUMN slug TEXT UNIQUE;
    END IF;
END $$;

-- Update products table to add category and variants if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='variants') THEN
        ALTER TABLE products ADD COLUMN variants JSONB DEFAULT '{}';
    END IF;
END $$;

-- Function to update product count when products are added/removed
CREATE OR REPLACE FUNCTION update_shop_product_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE seller_shops 
    SET product_count = product_count + 1 
    WHERE id = (SELECT shop_id FROM products WHERE seller_id = NEW.seller_id LIMIT 1);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE seller_shops 
    SET product_count = product_count - 1 
    WHERE id = (SELECT shop_id FROM products WHERE seller_id = OLD.seller_id LIMIT 1);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for product count
DROP TRIGGER IF EXISTS update_product_count_trigger ON products;
CREATE TRIGGER update_product_count_trigger
  AFTER INSERT OR DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_shop_product_count();