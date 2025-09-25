-- Create storage bucket for digital products
INSERT INTO storage.buckets (id, name, public) 
VALUES ('digital-products', 'digital-products', false);

-- Create storage policies for digital products
CREATE POLICY "Users can upload their own digital products" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'digital-products' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own digital products" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'digital-products' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own digital products" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'digital-products' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own digital products" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'digital-products' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create helpful database functions for wallet operations
CREATE OR REPLACE FUNCTION public.update_wallet_balance(
  user_id UUID,
  amount NUMERIC,
  currency_col TEXT
) 
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE format('UPDATE wallets SET %I = %I + %L WHERE user_id = %L',
    currency_col, currency_col, amount, user_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.release_escrow_funds(
  order_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_record RECORD;
  seller_wallet_id UUID;
  balance_field TEXT;
BEGIN
  -- Get order details
  SELECT * INTO order_record FROM orders WHERE id = order_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  
  -- Get seller wallet
  SELECT id INTO seller_wallet_id FROM wallets WHERE user_id = order_record.seller_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Seller wallet not found';
  END IF;
  
  -- Determine balance field based on currency
  balance_field := 'balance_' || lower(order_record.currency);
  
  -- Release funds to seller
  EXECUTE format('UPDATE wallets SET %I = %I + %L WHERE id = %L',
    balance_field, balance_field, order_record.total_amount, seller_wallet_id);
  
  -- Create transaction record
  INSERT INTO transactions (wallet_id, type, amount, currency, description, reference_id)
  VALUES (seller_wallet_id, 'escrow_release', order_record.total_amount, order_record.currency, 
          'Escrow release for order ' || order_id, 'ESC-' || order_id);
END;
$$;