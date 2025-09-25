-- Modifier la fonction handle_new_user pour générer automatiquement l'ID avec 3 chiffres et une lettre
CREATE OR REPLACE FUNCTION public.generate_client_id()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  number_part TEXT;
  letter_part TEXT;
  client_id TEXT;
BEGIN
  -- Générer 3 chiffres aléatoires
  number_part := LPAD(floor(random() * 1000)::int::text, 3, '0');
  
  -- Générer une lettre aléatoire de A à Z
  letter_part := chr(65 + floor(random() * 26)::int);
  
  -- Combiner pour former l'ID
  client_id := number_part || letter_part;
  
  RETURN client_id;
END;
$$;

-- Modifier la fonction handle_new_user pour inclure la génération automatique de l'ID
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  generated_client_id TEXT;
BEGIN
  -- Générer l'ID client automatiquement
  generated_client_id := generate_client_id();
  
  -- S'assurer que l'ID est unique (en cas de collision rare)
  WHILE EXISTS (SELECT 1 FROM profiles WHERE readable_id = generated_client_id) LOOP
    generated_client_id := generate_client_id();
  END LOOP;
  
  -- Insert profile for new user with better error handling and auto-generated client ID
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
    -- Log the error but don't block user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;