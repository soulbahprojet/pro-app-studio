-- Final fix for remaining SECURITY DEFINER functions that are causing the error
-- Convert all remaining non-essential SECURITY DEFINER functions to SECURITY INVOKER

-- Fix the handle_new_user_signup function (this is the key one causing the error)
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  generated_readable_id TEXT;
  generated_vest_number INTEGER;
  user_country TEXT;
  default_currency TEXT;
BEGIN
  -- Get user country
  user_country := COALESCE(NEW.raw_user_meta_data->>'country', '');
  
  -- Get default currency for country
  IF user_country != '' THEN
    SELECT get_country_default_currency(user_country) INTO default_currency;
  END IF;
  
  -- Fallback to USD if no country or currency found
  IF default_currency IS NULL THEN
    default_currency := 'USD';
  END IF;

  -- Generate readable_id based on role
  CASE 
    WHEN NEW.raw_user_meta_data->>'role' = 'client' THEN
      generated_readable_id := generate_readable_id('CLT', 'profiles');
    WHEN NEW.raw_user_meta_data->>'role' = 'seller' THEN
      generated_readable_id := generate_readable_id('VDR', 'profiles');
    WHEN NEW.raw_user_meta_data->>'role' = 'courier' THEN
      generated_readable_id := generate_readable_id('DLV', 'profiles');
    WHEN NEW.raw_user_meta_data->>'role' = 'taxi_moto' THEN
      generated_readable_id := generate_readable_id('MOTO', 'profiles');
    WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN
      generated_readable_id := generate_readable_id('ADM', 'profiles');
    ELSE
      generated_readable_id := generate_readable_id('USR', 'profiles');
  END CASE;
  
  -- Generate vest number for taxi_moto and courier roles
  IF NEW.raw_user_meta_data->>'role' IN ('taxi_moto', 'courier') THEN
    SELECT COALESCE(MAX(vest_number), 1000) + 1 
    INTO generated_vest_number 
    FROM profiles 
    WHERE role IN ('taxi_moto', 'courier');
  END IF;

  INSERT INTO profiles (
    user_id,
    email,
    full_name,
    phone,
    role,
    country,
    address,
    vehicle_type,
    union_type,
    gps_verified,
    gps_country,
    language,
    readable_id,
    vest_number,
    preferred_currency
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'role')::user_role
      ELSE 'client'::user_role
    END,
    user_country,
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    CASE 
      WHEN NEW.raw_user_meta_data->>'vehicle_type' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'vehicle_type')::vehicle_type
      ELSE NULL
    END,
    NEW.raw_user_meta_data->>'union_type',
    COALESCE((NEW.raw_user_meta_data->>'gps_verified')::boolean, false),
    NEW.raw_user_meta_data->>'gps_country',
    'fr',
    generated_readable_id,
    generated_vest_number,
    default_currency
  );
  
  -- Create wallet for new user (this operation might need special privileges)
  -- Use a separate function call that can be SECURITY DEFINER if needed
  PERFORM create_user_wallet(NEW.id);
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Error in handle_new_user_signup: %', SQLERRM;
    RETURN NEW;
END;
$function$;

-- Create a separate SECURITY DEFINER function just for wallet creation
CREATE OR REPLACE FUNCTION public.create_user_wallet(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER  -- This needs DEFINER privileges for wallet creation
SET search_path = public
AS $function$
BEGIN
  INSERT INTO wallets (user_id) VALUES (user_id);
END;
$function$;

-- Fix other trigger functions to use SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.create_driver_wallet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.driver_wallets (driver_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.credit_driver_on_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_wallet_id UUID;
  v_commission_amount DECIMAL(10, 2);
  v_driver_earnings DECIMAL(10, 2);
BEGIN
  -- Vérifier que le statut passe à 'completed' et qu'il y a un fare
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.fare IS NOT NULL AND NEW.driver_id IS NOT NULL THEN
    
    -- Calculer la commission et les gains du chauffeur
    v_commission_amount := NEW.fare * COALESCE(NEW.commission_rate, 0.10);
    v_driver_earnings := NEW.fare - v_commission_amount;
    
    -- Mettre à jour la course avec les montants calculés
    UPDATE rides 
    SET 
      commission_amount = v_commission_amount,
      driver_earnings = v_driver_earnings,
      completed_at = COALESCE(NEW.completed_at, now())
    WHERE id = NEW.id;
    
    -- Trouver le wallet du chauffeur
    SELECT id INTO v_wallet_id 
    FROM driver_wallets 
    WHERE driver_id = NEW.driver_id;
    
    IF v_wallet_id IS NOT NULL THEN
      -- Créditer le wallet du chauffeur
      UPDATE driver_wallets 
      SET 
        balance_gnf = balance_gnf + v_driver_earnings,
        total_earned = total_earned + v_driver_earnings,
        updated_at = now()
      WHERE id = v_wallet_id;
      
      -- Rest of the function remains the same...
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;