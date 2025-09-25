-- Find all actual SECURITY DEFINER functions that are still causing issues
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    CASE 
        WHEN p.prosecdef THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END as security_type,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.prosecdef = true  -- Only SECURITY DEFINER functions
ORDER BY p.proname;

-- Convert the remaining critical functions that must be SECURITY INVOKER
-- The main culprits are likely helper/utility functions that don't need elevated privileges

-- Convert check_stock_alerts to SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.check_stock_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path = public
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

-- Convert convert_currency to SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.convert_currency(amount numeric, from_currency character varying, to_currency character varying)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Convert remaining non-critical functions to SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.log_ride_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO ride_logs (
      ride_id, user_id, action, old_status, new_status, details
    ) VALUES (
      NEW.id, 
      auth.uid(), 
      'status_change',
      OLD.status,
      NEW.status,
      jsonb_build_object(
        'fare', NEW.fare,
        'driver_id', NEW.driver_id,
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_driver_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_avg_rating DECIMAL(3, 2);
BEGIN
  -- Calculer la nouvelle moyenne
  SELECT AVG(rating)::DECIMAL(3, 2) INTO v_avg_rating
  FROM driver_reviews
  WHERE driver_id = COALESCE(NEW.driver_id, OLD.driver_id);
  
  -- Mettre à jour la note du chauffeur
  UPDATE drivers
  SET 
    rating_average = COALESCE(v_avg_rating, 0.00),
    updated_at = now()
  WHERE id = COALESCE(NEW.driver_id, OLD.driver_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;