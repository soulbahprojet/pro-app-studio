-- FINALISATION DE LA SÉCURISATION - Dernières fonctions critiques
-- Élimination complète des warnings "Function Search Path Mutable"

-- 18. Sécurisation des fonctions de gestion KYC
CREATE OR REPLACE FUNCTION public.update_kyc_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
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
$$;

-- 19. Sécurisation des fonctions de gestion des numéros de veste
CREATE OR REPLACE FUNCTION public.assign_vest_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
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
$$;

-- 20. Sécurisation des fonctions de gestion des utilisateurs
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    preferred_currency -- Assigner la devise par défaut selon le pays
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
    -- Properly cast vehicle_type if it exists
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
    default_currency -- Devise par défaut selon le pays
  );
  
  -- Create wallet for new user
  INSERT INTO wallets (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Error in handle_new_user_signup: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 21. Sécurisation des fonctions de mise à jour de stock
CREATE OR REPLACE FUNCTION public.update_storage_usage()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE profiles 
  SET storage_used_gb = calculate_storage_usage(NEW.seller_id)
  WHERE user_id = NEW.seller_id;
  
  RETURN NEW;
END;
$$;

-- 22. Sécurisation des fonctions de génération de numéros
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN 'INV-' || LPAD(nextval('invoice_number_seq')::TEXT, 5, '0');
END;
$$;

-- 23. Sécurisation des fonctions de génération de tickets
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  ticket_num TEXT;
BEGIN
  ticket_num := 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                LPAD((SELECT COUNT(*) + 1 FROM road_tickets WHERE DATE(created_at) = CURRENT_DATE)::TEXT, 4, '0');
  RETURN ticket_num;
END;
$$;

-- 24. Sécurisation des fonctions de gestion des alertes de stock
CREATE OR REPLACE FUNCTION public.check_stock_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- 25. Sécurisation finale des fonctions système critiques
CREATE OR REPLACE FUNCTION public.get_country_default_currency(country_code text)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT default_currency 
  FROM country_currencies 
  WHERE country_code = UPPER(get_country_default_currency.country_code)
  LIMIT 1;
$$;