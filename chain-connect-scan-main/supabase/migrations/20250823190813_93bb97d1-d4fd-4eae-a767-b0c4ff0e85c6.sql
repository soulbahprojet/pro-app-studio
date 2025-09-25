-- Création des tables pour le module vendeur

-- Table des profils vendeur
CREATE TABLE public.vendor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  registration_number TEXT,
  tax_id TEXT,
  address JSONB,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  description TEXT,
  logo TEXT,
  is_active BOOLEAN DEFAULT false,
  kyc_status TEXT DEFAULT 'incomplete' CHECK (kyc_status IN ('pending', 'approved', 'rejected', 'incomplete')),
  kyc_documents JSONB DEFAULT '[]',
  rating DECIMAL(2,1) DEFAULT 0,
  total_sales DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des portefeuilles vendeur
CREATE TABLE public.vendor_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL(12,2) DEFAULT 0,
  total_earnings DECIMAL(12,2) DEFAULT 0,
  pending_amount DECIMAL(12,2) DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table de l'inventaire
CREATE TABLE public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quantity_available INTEGER DEFAULT 0,
  quantity_reserved INTEGER DEFAULT 0,
  quantity_sold INTEGER DEFAULT 0,
  reorder_threshold INTEGER DEFAULT 10,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des logs de stock
CREATE TABLE public.stock_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN ('sale', 'restock', 'adjustment', 'reservation', 'return')),
  quantity_change INTEGER NOT NULL,
  previous_qty INTEGER NOT NULL,
  new_qty INTEGER NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  user_id UUID REFERENCES auth.users(id),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des transactions vendeur
CREATE TABLE public.vendor_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id),
  payout_request_id UUID,
  type TEXT NOT NULL CHECK (type IN ('sale', 'payout', 'fee', 'refund')),
  amount DECIMAL(12,2) NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des demandes de retrait
CREATE TABLE public.payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  net_amount DECIMAL(12,2) NOT NULL,
  fees DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  bank_details JSONB NOT NULL,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "vendors_own_profile" ON public.vendor_profiles FOR ALL USING (user_id = auth.uid());
CREATE POLICY "vendors_own_wallet" ON public.vendor_wallets FOR ALL USING (vendor_id = auth.uid());
CREATE POLICY "vendors_own_inventory" ON public.inventory FOR ALL USING (vendor_id = auth.uid());
CREATE POLICY "vendors_own_stock_logs" ON public.stock_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.products WHERE id = stock_logs.product_id AND seller_id = auth.uid())
);
CREATE POLICY "vendors_own_transactions" ON public.vendor_transactions FOR ALL USING (vendor_id = auth.uid());
CREATE POLICY "vendors_own_payouts" ON public.payout_requests FOR ALL USING (vendor_id = auth.uid());

-- Fonction pour réserver le stock
CREATE OR REPLACE FUNCTION reserve_stock(p_product_id UUID, p_quantity INTEGER, p_order_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.inventory 
  SET 
    quantity_available = quantity_available - p_quantity,
    quantity_reserved = quantity_reserved + p_quantity,
    last_updated = now()
  WHERE product_id = p_product_id 
    AND quantity_available >= p_quantity;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour confirmer une vente
CREATE OR REPLACE FUNCTION confirm_sale(p_product_id UUID, p_quantity INTEGER, p_order_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.inventory 
  SET 
    quantity_reserved = quantity_reserved - p_quantity,
    quantity_sold = quantity_sold + p_quantity,
    last_updated = now()
  WHERE product_id = p_product_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour libérer une réservation
CREATE OR REPLACE FUNCTION release_reservation(p_product_id UUID, p_quantity INTEGER, p_order_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.inventory 
  SET 
    quantity_available = quantity_available + p_quantity,
    quantity_reserved = quantity_reserved - p_quantity,
    last_updated = now()
  WHERE product_id = p_product_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;