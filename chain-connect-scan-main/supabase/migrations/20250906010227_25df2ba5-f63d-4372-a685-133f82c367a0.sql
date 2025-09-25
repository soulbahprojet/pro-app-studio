-- Fix Security Definer functions to use Security Invoker where appropriate
-- This addresses the security linter warning about functions bypassing RLS

-- 1. Fix calculate_storage_usage to use SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.calculate_storage_usage(user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $function$
DECLARE
  total_size NUMERIC := 0;
  product_images_size NUMERIC := 0;
BEGIN
  -- Only allow users to calculate their own storage usage
  IF auth.uid() != user_id AND NOT is_pdg_user() THEN
    RAISE EXCEPTION 'Access denied: You can only calculate your own storage usage';
  END IF;
  
  -- Calculer la taille des images de produits (estimation basée sur le nombre d'images)
  SELECT COALESCE(SUM(array_length(images, 1)) * 0.5, 0) INTO product_images_size
  FROM products 
  WHERE seller_id = user_id;
  
  total_size := product_images_size;
  
  RETURN ROUND(total_size, 2);
END;
$function$;

-- 2. Fix check_and_assign_badges to use SECURITY INVOKER with proper access control
CREATE OR REPLACE FUNCTION public.check_and_assign_badges(p_courier_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $function$
DECLARE
  courier_stats RECORD;
BEGIN
  -- Only allow system/PDG users or the courier themselves to assign badges
  IF auth.uid() != p_courier_id AND NOT is_pdg_user() THEN
    RAISE EXCEPTION 'Access denied: You can only manage your own badges';
  END IF;

  -- Récupérer les statistiques du livreur
  SELECT 
    total_missions,
    completed_missions,
    success_rate,
    average_rating
  INTO courier_stats
  FROM profiles
  WHERE user_id = p_courier_id;

  -- Badge Rapidité (10+ missions avec taux de succès > 95%)
  IF courier_stats.total_missions >= 10 AND courier_stats.success_rate >= 95.0 THEN
    INSERT INTO badges (courier_id, badge_type, name, description, icon, color)
    VALUES (p_courier_id, 'speed', 'Éclair', 'Livreur ultra-rapide', '⚡', '#F59E0B')
    ON CONFLICT (courier_id, badge_type) DO NOTHING;
  END IF;

  -- Badge Fiabilité (20+ missions avec note moyenne > 4.5)
  IF courier_stats.total_missions >= 20 AND courier_stats.average_rating >= 4.5 THEN
    INSERT INTO badges (courier_id, badge_type, name, description, icon, color)
    VALUES (p_courier_id, 'reliability', 'Fiable', 'Livreur de confiance', '🛡️', '#10B981')
    ON CONFLICT (courier_id, badge_type) DO NOTHING;
  END IF;

  -- Badge Missions (50+ missions complétées)
  IF courier_stats.completed_missions >= 50 THEN
    INSERT INTO badges (courier_id, badge_type, name, description, icon, color)
    VALUES (p_courier_id, 'missions', 'Expert', 'Professionnel expérimenté', '🏆', '#8B5CF6')
    ON CONFLICT (courier_id, badge_type) DO NOTHING;
  END IF;

  -- Badge Excellence (100+ missions, 98%+ succès, 4.8+ note)
  IF courier_stats.total_missions >= 100 AND 
     courier_stats.success_rate >= 98.0 AND 
     courier_stats.average_rating >= 4.8 THEN
    INSERT INTO badges (courier_id, badge_type, name, description, icon, color)
    VALUES (p_courier_id, 'excellence', 'Excellence', 'Livreur d''excellence', '💎', '#EF4444')
    ON CONFLICT (courier_id, badge_type) DO NOTHING;
  END IF;

  -- Badge Vétéran (500+ missions)
  IF courier_stats.completed_missions >= 500 THEN
    INSERT INTO badges (courier_id, badge_type, name, description, icon, color)
    VALUES (p_courier_id, 'veteran', 'Vétéran', 'Maître de la livraison', '👑', '#DC2626')
    ON CONFLICT (courier_id, badge_type) DO NOTHING;
  END IF;
END;
$function$;

-- 3. Keep critical functions as SECURITY DEFINER but add proper access controls
-- Update wallet functions to have proper authorization checks
CREATE OR REPLACE FUNCTION public.update_wallet_balance(user_id uuid, amount numeric, currency_col text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Only allow PDG users or system operations to directly modify wallet balances
  IF NOT is_pdg_user() THEN
    RAISE EXCEPTION 'Access denied: Only PDG users can directly modify wallet balances';
  END IF;
  
  EXECUTE format('UPDATE wallets SET %I = %I + %L WHERE user_id = %L',
    currency_col, currency_col, amount, user_id);
END;
$function$;

-- 4. Add proper access control to escrow functions
CREATE OR REPLACE FUNCTION public.process_escrow_payment(p_order_id uuid, p_customer_id uuid, p_seller_id uuid, p_total_amount numeric, p_commission_rate numeric DEFAULT 0.20, p_currency text DEFAULT 'GNF'::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_escrow_id UUID;
  v_seller_amount NUMERIC;
  v_commission_amount NUMERIC;
  v_customer_wallet_id UUID;
  v_balance_field TEXT;
  v_customer_balance NUMERIC;
BEGIN
  -- Only allow customer, seller, or PDG to process escrow
  IF auth.uid() NOT IN (p_customer_id, p_seller_id) AND NOT is_pdg_user() THEN
    RAISE EXCEPTION 'Access denied: You can only process escrow for your own transactions';
  END IF;
  
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