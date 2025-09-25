-- Create escrow transactions table for internal escrow system
CREATE TABLE public.escrow_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id),
  customer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  total_amount NUMERIC NOT NULL,
  seller_amount NUMERIC NOT NULL,
  commission_amount NUMERIC NOT NULL,
  commission_rate NUMERIC NOT NULL DEFAULT 0.20,
  currency currency_type NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'released', 'disputed', 'refunded')),
  delivery_confirmed_at TIMESTAMP WITH TIME ZONE,
  released_at TIMESTAMP WITH TIME ZONE,
  disputed_at TIMESTAMP WITH TIME ZONE,
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on escrow_transactions
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for escrow_transactions
CREATE POLICY "Users can view their own escrow transactions" 
ON public.escrow_transactions 
FOR SELECT 
USING (auth.uid() = customer_id OR auth.uid() = seller_id);

CREATE POLICY "System can manage escrow transactions" 
ON public.escrow_transactions 
FOR ALL 
USING (true);

-- Add escrow fields to transactions table for better tracking
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS escrow_id UUID REFERENCES public.escrow_transactions(id);

-- Create function to handle escrow payment
CREATE OR REPLACE FUNCTION public.process_escrow_payment(
  p_order_id UUID,
  p_customer_id UUID,
  p_seller_id UUID,
  p_total_amount NUMERIC,
  p_commission_rate NUMERIC DEFAULT 0.20,
  p_currency TEXT DEFAULT 'GNF'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_escrow_id UUID;
  v_seller_amount NUMERIC;
  v_commission_amount NUMERIC;
  v_customer_wallet_id UUID;
  v_balance_field TEXT;
  v_customer_balance NUMERIC;
BEGIN
  -- Calculate amounts
  v_commission_amount := p_total_amount * p_commission_rate;
  v_seller_amount := p_total_amount - v_commission_amount;
  
  -- Get customer wallet
  SELECT id INTO v_customer_wallet_id FROM wallets WHERE user_id = p_customer_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Customer wallet not found';
  END IF;
  
  -- Check customer balance
  v_balance_field := 'balance_' || lower(p_currency);
  EXECUTE format('SELECT %I FROM wallets WHERE id = %L', v_balance_field, v_customer_wallet_id) INTO v_customer_balance;
  
  IF v_customer_balance < p_total_amount THEN
    RAISE EXCEPTION 'Insufficient customer balance: % required, % available', p_total_amount, v_customer_balance;
  END IF;
  
  -- Create escrow transaction record
  INSERT INTO escrow_transactions (
    order_id, customer_id, seller_id,
    total_amount, seller_amount, commission_amount, commission_rate, currency
  ) VALUES (
    p_order_id, p_customer_id, p_seller_id,
    p_total_amount, v_seller_amount, v_commission_amount, p_commission_rate, p_currency::currency_type
  ) RETURNING id INTO v_escrow_id;
  
  -- Transfer money from customer wallet to escrow (held in system)
  EXECUTE format('UPDATE wallets SET %I = %I - %L WHERE id = %L', 
    v_balance_field, v_balance_field, p_total_amount, v_customer_wallet_id);
  
  -- Create transaction record for customer payment
  INSERT INTO transactions (wallet_id, type, amount, currency, description, reference_id, escrow_id)
  VALUES (
    v_customer_wallet_id, 
    'escrow_payment', 
    -p_total_amount, 
    p_currency::currency_type, 
    'Payment to escrow for order ' || p_order_id, 
    'ESC-' || v_escrow_id,
    v_escrow_id
  );
  
  RETURN v_escrow_id;
END;
$$;

-- Create function to release escrow funds
CREATE OR REPLACE FUNCTION public.release_escrow_payment(
  p_escrow_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_escrow RECORD;
  v_seller_wallet_id UUID;
  v_balance_field TEXT;
BEGIN
  -- Get escrow details
  SELECT * INTO v_escrow FROM escrow_transactions WHERE id = p_escrow_id AND status = 'delivered';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Escrow transaction not found or not ready for release';
  END IF;
  
  -- Get seller wallet
  SELECT id INTO v_seller_wallet_id FROM wallets WHERE user_id = v_escrow.seller_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Seller wallet not found';
  END IF;
  
  v_balance_field := 'balance_' || lower(v_escrow.currency);
  
  -- Transfer seller amount to seller
  EXECUTE format('UPDATE wallets SET %I = %I + %L WHERE id = %L', 
    v_balance_field, v_balance_field, v_escrow.seller_amount, v_seller_wallet_id);
  
  -- Create transaction records
  INSERT INTO transactions (wallet_id, type, amount, currency, description, reference_id, escrow_id)
  VALUES 
    (v_seller_wallet_id, 'escrow_release', v_escrow.seller_amount, v_escrow.currency, 'Payment received for order ' || v_escrow.order_id, 'REL-' || p_escrow_id, v_escrow.id);
  
  -- Commission is tracked but stays in the system (virtual admin wallet)
  INSERT INTO transactions (wallet_id, type, amount, currency, description, reference_id, escrow_id)
  VALUES 
    (NULL, 'commission', v_escrow.commission_amount, v_escrow.currency, 'Platform commission from order ' || v_escrow.order_id, 'COM-' || p_escrow_id, v_escrow.id);
  
  -- Update escrow status
  UPDATE escrow_transactions 
  SET status = 'released', released_at = now(), updated_at = now()
  WHERE id = p_escrow_id;
END;
$$;

-- Create function to handle disputes and refunds
CREATE OR REPLACE FUNCTION public.handle_escrow_dispute(
  p_escrow_id UUID,
  p_action TEXT, -- 'refund' or 'release'
  p_resolution TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_escrow RECORD;
  v_customer_wallet_id UUID;
  v_seller_wallet_id UUID;
  v_balance_field TEXT;
BEGIN
  -- Get escrow details
  SELECT * INTO v_escrow FROM escrow_transactions WHERE id = p_escrow_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Escrow transaction not found';
  END IF;
  
  -- Get wallet IDs
  SELECT id INTO v_customer_wallet_id FROM wallets WHERE user_id = v_escrow.customer_id;
  SELECT id INTO v_seller_wallet_id FROM wallets WHERE user_id = v_escrow.seller_id;
  
  v_balance_field := 'balance_' || lower(v_escrow.currency);
  
  IF p_action = 'refund' THEN
    -- Refund to customer
    EXECUTE format('UPDATE wallets SET %I = %I + %L WHERE id = %L', 
      v_balance_field, v_balance_field, v_escrow.total_amount, v_customer_wallet_id);
    
    -- Create transaction records
    INSERT INTO transactions (wallet_id, type, amount, currency, description, reference_id, escrow_id)
    VALUES 
      (v_customer_wallet_id, 'refund', v_escrow.total_amount, v_escrow.currency, 'Refund for order ' || v_escrow.order_id, 'REF-' || p_escrow_id, v_escrow.id);
    
    UPDATE escrow_transactions 
    SET status = 'refunded', resolution = p_resolution, updated_at = now()
    WHERE id = p_escrow_id;
    
  ELSIF p_action = 'release' THEN
    -- Release to seller (similar to normal release)
    PERFORM release_escrow_payment(p_escrow_id);
    
  ELSE
    RAISE EXCEPTION 'Invalid action. Use refund or release';
  END IF;
END;
$$;

-- Create function to confirm delivery and mark escrow for release
CREATE OR REPLACE FUNCTION public.confirm_delivery_escrow(
  p_order_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_escrow_id UUID;
BEGIN
  -- Update escrow status to delivered
  UPDATE escrow_transactions 
  SET status = 'delivered', delivery_confirmed_at = now(), updated_at = now()
  WHERE order_id = p_order_id AND status = 'pending'
  RETURNING id INTO v_escrow_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No pending escrow found for order %', p_order_id;
  END IF;
  
  -- Automatically release the escrow payment
  PERFORM release_escrow_payment(v_escrow_id);
END;
$$;

-- Create trigger for timestamp updates
CREATE TRIGGER update_escrow_transactions_updated_at
  BEFORE UPDATE ON public.escrow_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();