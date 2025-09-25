-- Check for remaining SECURITY DEFINER functions that may need to be addressed
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    CASE 
        WHEN p.prosecdef THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END as security_type,
    pg_get_function_result(p.oid) as return_type,
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.prosecdef = true  -- Only SECURITY DEFINER functions
ORDER BY p.proname;

-- Fix the remaining problematic SECURITY DEFINER functions
-- These functions need to be converted to SECURITY INVOKER where appropriate

-- 1. Fix generate_readable_id function
CREATE OR REPLACE FUNCTION public.generate_readable_id(prefix text, table_name text, id_column text DEFAULT 'readable_id'::text)
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- 2. Fix generate_client_id function
CREATE OR REPLACE FUNCTION public.generate_client_id()
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  number_part TEXT;
  letter_part TEXT;
  client_id TEXT;
BEGIN
  -- Générer 3 chiffres aléatoires
  number_part := LPAD(floor(random() * 1000)::int::text, 3, '0');
  
  -- Générer 2 lettres aléatoires de A à Z
  letter_part := chr(65 + floor(random() * 26)::int) || chr(65 + floor(random() * 26)::int);
  
  -- Combiner pour former l'ID (3 chiffres + 2 lettres)
  client_id := number_part || letter_part;
  
  RETURN client_id;
END;
$function$;

-- 3. Fix generate_new_client_id function  
CREATE OR REPLACE FUNCTION public.generate_new_client_id()
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  number_part TEXT;
  letter_part TEXT;
  client_id TEXT;
BEGIN
  -- Générer 4 chiffres aléatoires
  number_part := LPAD(floor(random() * 10000)::int::text, 4, '0');
  
  -- Générer 2 lettres aléatoires de A à Z
  letter_part := chr(65 + floor(random() * 26)::int) || chr(65 + floor(random() * 26)::int);
  
  -- Combiner pour former l'ID (4 chiffres + 2 lettres)
  client_id := number_part || letter_part;
  
  RETURN client_id;
END;
$function$;

-- 4. Fix generate_transaction_code function
CREATE OR REPLACE FUNCTION public.generate_transaction_code()
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  letter_code TEXT;
  number_part TEXT;
  full_code TEXT;
BEGIN
  -- Générer une lettre aléatoire de A à Z
  letter_code := chr(65 + floor(random() * 26)::int);
  
  -- Générer un nombre à 3 chiffres
  number_part := LPAD(nextval('transaction_code_seq')::TEXT, 3, '0');
  
  -- Si le nombre dépasse 999, remettre la séquence à 1
  IF nextval('transaction_code_seq') > 999 THEN
    ALTER SEQUENCE transaction_code_seq RESTART WITH 1;
    number_part := '001';
  END IF;
  
  full_code := letter_code || number_part;
  
  RETURN full_code;
END;
$function$;

-- 5. Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 6. Fix update_updated_at_pro function
CREATE OR REPLACE FUNCTION public.update_updated_at_pro()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Keep some functions as SECURITY DEFINER but add proper access controls where needed
-- These are functions that genuinely need elevated privileges for system operations

-- Audit and security functions should remain SECURITY DEFINER for proper logging
CREATE OR REPLACE FUNCTION public.log_security_event(p_action_type text, p_table_name text DEFAULT NULL::text, p_record_id uuid DEFAULT NULL::uuid, p_old_values jsonb DEFAULT NULL::jsonb, p_new_values jsonb DEFAULT NULL::jsonb, p_severity text DEFAULT 'INFO'::text, p_metadata jsonb DEFAULT '{}'::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER  -- Keep as SECURITY DEFINER for audit logging
SET search_path = public
AS $function$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id, action_type, table_name, record_id,
    old_values, new_values, severity, metadata
  ) VALUES (
    auth.uid(), p_action_type, p_table_name, p_record_id,
    p_old_values, p_new_values, p_severity, p_metadata
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$function$;

-- System cleanup functions should remain SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.cleanup_old_security_tracking()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER  -- Keep as SECURITY DEFINER for system cleanup
SET search_path = public
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