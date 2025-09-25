-- Create table for vendor subscriptions and affiliates
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('basic', 'standard', 'premium')),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  commission_rate NUMERIC(5,2) DEFAULT 5.00,
  total_earnings NUMERIC(15,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.delivery_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  courier_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'picked_up', 'in_transit', 'delivered')),
  qr_code TEXT UNIQUE DEFAULT generate_qr_code(),
  pickup_location TEXT,
  delivery_location TEXT,
  courier_notes TEXT,
  customer_notes TEXT,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_tracking ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies
CREATE POLICY "Users can view their own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Affiliates policies
CREATE POLICY "Affiliates can view their earnings" ON public.affiliates
  FOR SELECT USING (auth.uid() = affiliate_id);

CREATE POLICY "Sellers can view their affiliates" ON public.affiliates
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "System can manage affiliates" ON public.affiliates
  FOR ALL USING (true);

-- Delivery tracking policies
CREATE POLICY "Users can view related deliveries" ON public.delivery_tracking
  FOR SELECT USING (
    auth.uid() = courier_id OR 
    order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid() OR seller_id = auth.uid())
  );

CREATE POLICY "Couriers can update their deliveries" ON public.delivery_tracking
  FOR UPDATE USING (auth.uid() = courier_id);

CREATE POLICY "System can manage deliveries" ON public.delivery_tracking
  FOR ALL USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_delivery_tracking_updated_at
  BEFORE UPDATE ON public.delivery_tracking
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();