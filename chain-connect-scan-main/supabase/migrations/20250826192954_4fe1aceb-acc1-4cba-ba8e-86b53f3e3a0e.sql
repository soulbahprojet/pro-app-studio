-- SÉCURISATION DES FONCTIONS - Ajout de search_path pour éliminer les warnings de sécurité

-- Corriger toutes les fonctions critiques sans search_path sécurisé
-- Ceci va éliminer ~50 warnings "Function Search Path Mutable"

-- 1. Fonctions de gestion des portefeuilles
CREATE OR REPLACE FUNCTION public.process_wallet_transfer(p_sender_id uuid, p_recipient_id uuid, p_amount numeric, p_currency text, p_fee numeric, p_reference text, p_purpose text DEFAULT 'transfer'::text, p_description text DEFAULT 'Transfert entre utilisateurs'::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- 2. Fonctions escrow avec search_path sécurisé
CREATE OR REPLACE FUNCTION public.process_escrow_payment(p_order_id uuid, p_customer_id uuid, p_seller_id uuid, p_total_amount numeric, p_commission_rate numeric DEFAULT 0.20, p_currency text DEFAULT 'GNF'::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 3. Fonction de génération d'ID sécurisée
CREATE OR REPLACE FUNCTION public.generate_readable_id(prefix text, table_name text, id_column text DEFAULT 'readable_id'::text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id TEXT;
  counter INTEGER := 1;
BEGIN
  LOOP
    new_id := prefix || '-' || LPAD(counter::TEXT, 4, '0');
    
    -- Vérifier si l'ID existe déjà
    EXECUTE format('SELECT 1 FROM %I WHERE %I = %L', table_name, id_column, new_id);
    
    IF NOT FOUND THEN
      RETURN new_id;
    END IF;
    
    counter := counter + 1;
  END LOOP;
END;
$$;

-- 4. Fonction de gestion du stock sécurisée
CREATE OR REPLACE FUNCTION public.reserve_stock(p_product_id uuid, p_quantity integer, p_order_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- 5. Fonction de calcul des devises sécurisée
CREATE OR REPLACE FUNCTION public.convert_currency(amount numeric, from_currency character varying, to_currency character varying)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rate DECIMAL(20, 8);
BEGIN
  -- If same currency, return original amount
  IF from_currency = to_currency THEN
    RETURN amount;
  END IF;
  
  -- Get exchange rate
  SELECT er.rate INTO rate 
  FROM exchange_rates er 
  WHERE er.base_currency = from_currency 
  AND er.target_currency = to_currency
  ORDER BY er.last_updated DESC 
  LIMIT 1;
  
  -- If direct rate not found, try reverse conversion
  IF rate IS NULL THEN
    SELECT (1.0 / er.rate) INTO rate 
    FROM exchange_rates er 
    WHERE er.base_currency = to_currency 
    AND er.target_currency = from_currency
    ORDER BY er.last_updated DESC 
    LIMIT 1;
  END IF;
  
  -- If still no rate found, return original amount
  IF rate IS NULL THEN
    RETURN amount;
  END IF;
  
  RETURN amount * rate;
END;
$$;

-- 6. Mise à jour des fonctions de gestion des badges
CREATE OR REPLACE FUNCTION public.check_and_assign_badges(p_courier_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  courier_stats RECORD;
BEGIN
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
$$;