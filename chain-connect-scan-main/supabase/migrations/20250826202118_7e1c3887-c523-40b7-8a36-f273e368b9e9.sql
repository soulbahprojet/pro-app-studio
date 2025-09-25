-- Final migration: Fix the last 4 functions without search_path
-- This completes the security fix for all database functions search_path issues

-- The remaining 4 warnings are likely for these remaining functions that need search_path:

-- Fix function: generate_transaction_code
CREATE OR REPLACE FUNCTION public.generate_transaction_code()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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

-- Fix function: generate_new_client_id
CREATE OR REPLACE FUNCTION public.generate_new_client_id()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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

-- Fix function: generate_client_id
CREATE OR REPLACE FUNCTION public.generate_client_id()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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

-- Fix function: generate_qr_code (if it exists and needs fixing)
CREATE OR REPLACE FUNCTION public.generate_qr_code()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN 'QR-' || encode(gen_random_bytes(8), 'hex');
END;
$function$;