-- Vérifier et corriger le trigger de création automatique de profils

-- D'abord, supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS public.handle_new_user_signup();

-- Recréer la fonction corrigée
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  generated_readable_id TEXT;
  generated_vest_number INTEGER;
  user_country TEXT;
  default_currency TEXT;
BEGIN
  -- Get user country
  user_country := COALESCE(NEW.raw_user_meta_data->>'country', 'GN');
  
  -- Get default currency for country
  IF user_country != '' THEN
    SELECT get_country_default_currency(user_country) INTO default_currency;
  END IF;
  
  -- Fallback to GNF if no country or currency found
  IF default_currency IS NULL THEN
    default_currency := 'GNF';
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
    FROM public.profiles 
    WHERE role IN ('taxi_moto', 'courier');
  END IF;

  INSERT INTO public.profiles (
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
      THEN (NEW.raw_user_meta_data->>'role')::public.user_role
      ELSE 'client'::public.user_role
    END,
    user_country,
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    CASE 
      WHEN NEW.raw_user_meta_data->>'vehicle_type' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'vehicle_type')::public.vehicle_type
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
  
  -- Create wallet for new user
  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log l'erreur mais ne pas bloquer la création de l'utilisateur
    RAISE WARNING 'Error in handle_new_user_signup: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_signup();

-- Créer les profils manquants pour les utilisateurs existants
INSERT INTO public.profiles (
  user_id,
  email,
  full_name,
  phone,
  role,
  country,
  address,
  gps_verified,
  language,
  readable_id,
  preferred_currency
)
SELECT 
  u.id as user_id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', 'Utilisateur') as full_name,
  COALESCE(u.raw_user_meta_data->>'phone', '') as phone,
  CASE 
    WHEN u.raw_user_meta_data->>'role' IS NOT NULL 
    THEN (u.raw_user_meta_data->>'role')::public.user_role
    ELSE 'client'::public.user_role
  END as role,
  COALESCE(u.raw_user_meta_data->>'country', 'GN') as country,
  COALESCE(u.raw_user_meta_data->>'address', '') as address,
  COALESCE((u.raw_user_meta_data->>'gps_verified')::boolean, false) as gps_verified,
  'fr' as language,
  CASE 
    WHEN u.raw_user_meta_data->>'role' = 'seller' THEN generate_readable_id('VDR', 'profiles')
    WHEN u.raw_user_meta_data->>'role' = 'courier' THEN generate_readable_id('DLV', 'profiles')
    ELSE generate_readable_id('CLT', 'profiles')
  END as readable_id,
  'GNF' as preferred_currency
FROM auth.users u
WHERE u.id NOT IN (SELECT user_id FROM public.profiles WHERE user_id IS NOT NULL)
  AND u.email IS NOT NULL;

-- Créer les portefeuilles manquants
INSERT INTO public.wallets (user_id)
SELECT u.id
FROM auth.users u
WHERE u.id NOT IN (SELECT user_id FROM public.wallets WHERE user_id IS NOT NULL)
  AND u.email IS NOT NULL;