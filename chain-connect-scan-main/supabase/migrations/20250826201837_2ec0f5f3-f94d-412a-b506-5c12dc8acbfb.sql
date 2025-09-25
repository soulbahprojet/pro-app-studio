-- Sécurisation des fonctions: ajout de SET search_path TO 'public' pour toutes les fonctions
-- Ceci corrige la vulnérabilité de sécurité détectée par le linter Supabase

-- Fix function: generate_report_number
CREATE OR REPLACE FUNCTION public.generate_report_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN 'RPT-' || TO_CHAR(now(), 'YYYY') || '-' || LPAD(nextval('report_number_seq')::TEXT, 6, '0');
END;
$function$;

-- Fix function: set_report_number
CREATE OR REPLACE FUNCTION public.set_report_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.official_report_number IS NULL THEN
    NEW.official_report_number := generate_report_number();
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix function: release_escrow_payment
CREATE OR REPLACE FUNCTION public.release_escrow_payment(p_escrow_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Fix function: handle_escrow_dispute
CREATE OR REPLACE FUNCTION public.handle_escrow_dispute(p_escrow_id uuid, p_action text, p_resolution text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Fix function: confirm_delivery_escrow
CREATE OR REPLACE FUNCTION public.confirm_delivery_escrow(p_order_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Fix function: calculate_auto_release_date
CREATE OR REPLACE FUNCTION public.calculate_auto_release_date()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.auto_release_at = NEW.held_since + (NEW.auto_release_after_days || ' days')::INTERVAL;
  RETURN NEW;
END;
$function$;

-- Fix function: update_shop_product_count
CREATE OR REPLACE FUNCTION public.update_shop_product_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Fix function: assign_vest_number
CREATE OR REPLACE FUNCTION public.assign_vest_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only assign vest number for couriers if not already set
  IF NEW.role = 'courier' AND (OLD.vest_number IS NULL OR NEW.vest_number IS NULL) THEN
    -- Get the next available vest number starting from 1001
    SELECT COALESCE(MAX(vest_number), 1000) + 1 
    INTO NEW.vest_number 
    FROM profiles 
    WHERE role = 'courier';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix function: set_tracking_code
CREATE OR REPLACE FUNCTION public.set_tracking_code()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.tracking_code IS NULL OR NEW.tracking_code = '' THEN
    NEW.tracking_code := generate_tracking_code();
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix function: generate_tracking_code
CREATE OR REPLACE FUNCTION public.generate_tracking_code()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  tracking_code TEXT;
  is_unique BOOLEAN := FALSE;
BEGIN
  WHILE NOT is_unique LOOP
    tracking_code := 'TRK-' || LPAD(floor(random() * 1000000)::TEXT, 7, '0');
    SELECT NOT EXISTS(SELECT 1 FROM shipments WHERE tracking_code = tracking_code) INTO is_unique;
  END LOOP;
  RETURN tracking_code;
END;
$function$;

-- Fix function: update_union_member_count
CREATE OR REPLACE FUNCTION public.update_union_member_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.is_active = true THEN
    UPDATE unions 
    SET member_count = member_count + 1 
    WHERE id = NEW.union_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_active = false AND NEW.is_active = true THEN
      UPDATE unions 
      SET member_count = member_count + 1 
      WHERE id = NEW.union_id;
    ELSIF OLD.is_active = true AND NEW.is_active = false THEN
      UPDATE unions 
      SET member_count = member_count - 1 
      WHERE id = NEW.union_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.is_active = true THEN
    UPDATE unions 
    SET member_count = member_count - 1 
    WHERE id = OLD.union_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Fix function: generate_ticket_number
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  ticket_num TEXT;
BEGIN
  ticket_num := 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                LPAD((SELECT COUNT(*) + 1 FROM road_tickets WHERE DATE(created_at) = CURRENT_DATE)::TEXT, 4, '0');
  RETURN ticket_num;
END;
$function$;

-- Fix function: update_kyc_status
CREATE OR REPLACE FUNCTION public.update_kyc_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  required_docs TEXT[] := ARRAY['identity']; -- Seule la pièce d'identité est requise maintenant
  approved_docs INTEGER;
  total_required INTEGER := array_length(required_docs, 1);
BEGIN
  -- Count approved documents for the user
  SELECT COUNT(*) INTO approved_docs
  FROM kyc_documents 
  WHERE user_id = NEW.user_id 
  AND document_type = ANY(required_docs)
  AND status = 'approved';
  
  -- Update profile KYC status based on document approval
  IF approved_docs = total_required THEN
    UPDATE profiles 
    SET kyc_status = 'approved', kyc_verified_at = now()
    WHERE user_id = NEW.user_id;
  ELSIF approved_docs > 0 THEN
    UPDATE profiles 
    SET kyc_status = 'under_review'
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix function: check_and_assign_badges
CREATE OR REPLACE FUNCTION public.check_and_assign_badges(p_courier_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Fix function: set_tracking_code_international
CREATE OR REPLACE FUNCTION public.set_tracking_code_international()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.tracking_code IS NULL OR NEW.tracking_code = '' THEN
    NEW.tracking_code := generate_tracking_code_international();
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix function: generate_claim_number
CREATE OR REPLACE FUNCTION public.generate_claim_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN 'CLM-' || LPAD(nextval('claim_number_seq')::TEXT, 6, '0');
END;
$function$;

-- Fix function: set_claim_number
CREATE OR REPLACE FUNCTION public.set_claim_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.claim_number IS NULL OR NEW.claim_number = '' THEN
    NEW.claim_number := generate_claim_number();
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix function: generate_tracking_code_international
CREATE OR REPLACE FUNCTION public.generate_tracking_code_international()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  tracking_code TEXT;
  is_unique BOOLEAN := FALSE;
BEGIN
  WHILE NOT is_unique LOOP
    tracking_code := 'INTL-' || LPAD(floor(random() * 10000000)::TEXT, 7, '0');
    SELECT NOT EXISTS(SELECT 1 FROM public.shipments_international_extended WHERE tracking_code = tracking_code) INTO is_unique;
  END LOOP;
  RETURN tracking_code;
END;
$function$;

-- Fix function: generate_employee_code
CREATE OR REPLACE FUNCTION public.generate_employee_code(forwarder_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  employee_code TEXT;
  company_prefix TEXT;
  counter INTEGER;
BEGIN
  -- Get company prefix from forwarder profile
  SELECT UPPER(LEFT(company_name, 3)) INTO company_prefix
  FROM public.freight_forwarder_profiles 
  WHERE id = forwarder_id;
  
  -- Get next counter
  SELECT COALESCE(MAX(CAST(RIGHT(employee_code, 4) AS INTEGER)), 0) + 1 
  INTO counter
  FROM public.freight_employees_extended 
  WHERE forwarder_id = generate_employee_code.forwarder_id;
  
  employee_code := company_prefix || '-EMP-' || LPAD(counter::TEXT, 4, '0');
  
  RETURN employee_code;
END;
$function$;

-- Fix function: update_virtual_cards_updated_at
CREATE OR REPLACE FUNCTION public.update_virtual_cards_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix function: update_shipment_updated_at
CREATE OR REPLACE FUNCTION public.update_shipment_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix function: check_stock_alerts
CREATE OR REPLACE FUNCTION public.check_stock_alerts()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Insérer de nouvelles alertes pour les produits en stock faible
  INSERT INTO stock_alerts (product_id, seller_id, current_stock, threshold)
  SELECT 
    p.id,
    p.seller_id,
    p.stock_quantity,
    COALESCE((pr.pos_settings->>'low_stock_alert')::integer, 10)
  FROM products p
  LEFT JOIN profiles pr ON pr.user_id = p.seller_id
  WHERE p.stock_quantity <= COALESCE((pr.pos_settings->>'low_stock_alert')::integer, 10)
    AND p.stock_quantity > 0
    AND NOT EXISTS (
      SELECT 1 FROM stock_alerts sa 
      WHERE sa.product_id = p.id 
        AND sa.is_active = true
    );
    
  -- Résoudre les alertes pour les produits qui ont été réapprovisionnés
  UPDATE stock_alerts 
  SET is_active = false, resolved_at = now()
  WHERE is_active = true
    AND product_id IN (
      SELECT p.id FROM products p
      JOIN profiles pr ON pr.user_id = p.seller_id
      WHERE p.stock_quantity > COALESCE((pr.pos_settings->>'low_stock_alert')::integer, 10)
    );
END;
$function$;