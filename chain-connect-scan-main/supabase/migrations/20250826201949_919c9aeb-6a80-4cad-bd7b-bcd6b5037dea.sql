-- Migration Part 2: Fix remaining functions without search_path
-- This completes the security fix for all database functions

-- Fix remaining functions that don't have search_path set

-- Fix function: generate_cvv
CREATE OR REPLACE FUNCTION public.generate_cvv()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
END;
$function$;

-- Fix function: set_ticket_number
CREATE OR REPLACE FUNCTION public.set_ticket_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix function: generate_card_number
CREATE OR REPLACE FUNCTION public.generate_card_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  card_number TEXT;
  is_unique BOOLEAN := FALSE;
BEGIN
  WHILE NOT is_unique LOOP
    card_number := '4224' || LPAD(FLOOR(RANDOM() * 1000000000000)::TEXT, 12, '0');
    SELECT NOT EXISTS(SELECT 1 FROM virtual_cards WHERE card_number = generate_card_number.card_number) INTO is_unique;
  END LOOP;
  RETURN card_number;
END;
$function$;

-- Fix function: generate_invoice_number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN 'INV-' || LPAD(nextval('invoice_number_seq')::TEXT, 5, '0');
END;
$function$;

-- Fix function: cleanup_old_security_tracking
CREATE OR REPLACE FUNCTION public.cleanup_old_security_tracking()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Garder seulement les 30 derniers jours de tracking
  DELETE FROM security_tracking 
  WHERE created_at < (now() - interval '30 days');
  
  -- Garder seulement les 90 derniers jours d'alertes résolues
  DELETE FROM security_alerts 
  WHERE is_resolved = true 
  AND resolved_at < (now() - interval '90 days');
  
  -- Supprimer les commandes expirées
  DELETE FROM remote_security_commands 
  WHERE expires_at < now();
END;
$function$;

-- Fix function: process_wallet_transfer
CREATE OR REPLACE FUNCTION public.process_wallet_transfer(p_sender_id uuid, p_recipient_id uuid, p_amount numeric, p_currency text, p_fee numeric, p_reference text, p_purpose text DEFAULT 'transfer'::text, p_description text DEFAULT 'Transfert entre utilisateurs'::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sender_wallet_id UUID;
  v_recipient_wallet_id UUID;
  v_balance_field TEXT;
  v_sender_balance NUMERIC;
  v_recipient_balance NUMERIC;
BEGIN
  -- Get wallet IDs
  SELECT id INTO v_sender_wallet_id FROM wallets WHERE user_id = p_sender_id;
  SELECT id INTO v_recipient_wallet_id FROM wallets WHERE user_id = p_recipient_id;
  
  IF v_sender_wallet_id IS NULL THEN
    RAISE EXCEPTION 'Sender wallet not found';
  END IF;
  
  IF v_recipient_wallet_id IS NULL THEN
    RAISE EXCEPTION 'Recipient wallet not found';
  END IF;
  
  -- Construct balance field name
  v_balance_field := 'balance_' || lower(p_currency);
  
  -- Get current balances
  EXECUTE format('SELECT %I FROM wallets WHERE id = %L', v_balance_field, v_sender_wallet_id) INTO v_sender_balance;
  EXECUTE format('SELECT %I FROM wallets WHERE id = %L', v_balance_field, v_recipient_wallet_id) INTO v_recipient_balance;
  
  -- Check sender balance
  IF v_sender_balance < (p_amount + p_fee) THEN
    RAISE EXCEPTION 'Insufficient balance. Required: %, Available: %', (p_amount + p_fee), v_sender_balance;
  END IF;
  
  -- Update sender balance (subtract amount + fee)
  EXECUTE format('UPDATE wallets SET %I = %I - %L WHERE id = %L', 
    v_balance_field, v_balance_field, (p_amount + p_fee), v_sender_wallet_id);
  
  -- Update recipient balance (add amount)
  EXECUTE format('UPDATE wallets SET %I = %I + %L WHERE id = %L', 
    v_balance_field, v_balance_field, p_amount, v_recipient_wallet_id);
  
  -- Create sender transaction (debit) - using 'transfer' type
  INSERT INTO transactions (
    wallet_id, type, amount, currency, status, description, reference_id
  ) VALUES (
    v_sender_wallet_id, 
    'transfer'::transaction_type, 
    -(p_amount + p_fee), 
    upper(p_currency)::currency_type, 
    'completed', 
    p_description || ' (envoyé)', 
    gen_random_uuid()
  );
  
  -- Create recipient transaction (credit) - using 'payment' type  
  INSERT INTO transactions (
    wallet_id, type, amount, currency, status, description, reference_id
  ) VALUES (
    v_recipient_wallet_id, 
    'payment'::transaction_type, 
    p_amount, 
    upper(p_currency)::currency_type, 
    'completed', 
    p_description || ' (reçu)', 
    gen_random_uuid()
  );
END;
$function$;

-- Fix function: process_escrow_payment
CREATE OR REPLACE FUNCTION public.process_escrow_payment(p_order_id uuid, p_customer_id uuid, p_seller_id uuid, p_total_amount numeric, p_commission_rate numeric DEFAULT 0.20, p_currency text DEFAULT 'GNF'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Fix function: update_wallet_balance
CREATE OR REPLACE FUNCTION public.update_wallet_balance(user_id uuid, amount numeric, currency_col text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  EXECUTE format('UPDATE wallets SET %I = %I + %L WHERE user_id = %L',
    currency_col, currency_col, amount, user_id);
END;
$function$;

-- Fix function: release_escrow_funds
CREATE OR REPLACE FUNCTION public.release_escrow_funds(order_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Fix function: confirm_sale
CREATE OR REPLACE FUNCTION public.confirm_sale(p_product_id uuid, p_quantity integer, p_order_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE inventory 
  SET 
    quantity_reserved = quantity_reserved - p_quantity,
    quantity_sold = quantity_sold + p_quantity,
    last_updated = now()
  WHERE product_id = p_product_id;
  
  RETURN FOUND;
END;
$function$;

-- Fix function: release_reservation
CREATE OR REPLACE FUNCTION public.release_reservation(p_product_id uuid, p_quantity integer, p_order_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE inventory 
  SET 
    quantity_available = quantity_available + p_quantity,
    quantity_reserved = quantity_reserved - p_quantity,
    last_updated = now()
  WHERE product_id = p_product_id;
  
  RETURN FOUND;
END;
$function$;

-- Fix function: reserve_stock
CREATE OR REPLACE FUNCTION public.reserve_stock(p_product_id uuid, p_quantity integer, p_order_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE inventory 
  SET 
    quantity_available = quantity_available - p_quantity,
    quantity_reserved = quantity_reserved + p_quantity,
    last_updated = now()
  WHERE product_id = p_product_id 
    AND quantity_available >= p_quantity;
  
  RETURN FOUND;
END;
$function$;

-- Fix function: calculate_storage_usage
CREATE OR REPLACE FUNCTION public.calculate_storage_usage(user_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  total_size NUMERIC := 0;
  product_images_size NUMERIC := 0;
BEGIN
  -- Calculer la taille des images de produits (estimation basée sur le nombre d'images)
  SELECT COALESCE(SUM(array_length(images, 1)) * 0.5, 0) INTO product_images_size
  FROM products 
  WHERE seller_id = user_id;
  
  total_size := product_images_size;
  
  RETURN ROUND(total_size, 2);
END;
$function$;

-- Fix function: update_storage_usage
CREATE OR REPLACE FUNCTION public.update_storage_usage()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE profiles 
  SET storage_used_gb = calculate_storage_usage(NEW.seller_id)
  WHERE user_id = NEW.seller_id;
  
  RETURN NEW;
END;
$function$;

-- Fix function: generate_badge_number
CREATE OR REPLACE FUNCTION public.generate_badge_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  badge_num TEXT;
BEGIN
  badge_num := 'BDG-' || LPAD(EXTRACT(YEAR FROM NOW())::TEXT, 4, '0') || '-' || 
               LPAD((SELECT COUNT(*) + 1 FROM syndicat_members)::TEXT, 6, '0');
  RETURN badge_num;
END;
$function$;

-- Fix function: set_auto_badge_number
CREATE OR REPLACE FUNCTION public.set_auto_badge_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.badge_number IS NULL THEN
    NEW.badge_number := generate_badge_number();
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix function: set_auto_ticket_number
CREATE OR REPLACE FUNCTION public.set_auto_ticket_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  IF NEW.qr_code IS NULL THEN
    NEW.qr_code := 'QR-' || encode(gen_random_bytes(8), 'hex');
  END IF;
  RETURN NEW;
END;
$function$;