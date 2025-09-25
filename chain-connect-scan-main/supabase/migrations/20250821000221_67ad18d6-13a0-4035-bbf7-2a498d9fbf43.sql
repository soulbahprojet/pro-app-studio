-- Migration partie 2: Mise à jour fonction handle_new_user

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  generated_client_id TEXT;
BEGIN
  -- Générer l'ID client avec le nouveau format
  generated_client_id := generate_new_client_id();
  
  -- S'assurer que l'ID est unique
  WHILE EXISTS (SELECT 1 FROM profiles WHERE readable_id = generated_client_id) LOOP
    generated_client_id := generate_new_client_id();
  END LOOP;
  
  -- Insert profile for new user
  INSERT INTO public.profiles (
    user_id, 
    email, 
    full_name, 
    role, 
    phone, 
    country, 
    address,
    readable_id
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'fullName', ''),
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'role')::public.user_role
      ELSE 'client'::public.user_role
    END,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'country', ''),
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    generated_client_id
  );
  
  -- Insert wallet for new user
  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$