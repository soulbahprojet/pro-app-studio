-- Fix the user profile creation issue
-- First, let's insert the missing profile for the existing user

INSERT INTO public.profiles (
  user_id,
  email,
  full_name,
  phone,
  role,
  country,
  address,
  language,
  readable_id,
  vest_number,
  gps_verified
) VALUES (
  '01941c9c-1cfd-4548-a816-b4f7b0321763',
  'bahthiernosouleymane00@gmail.com',
  'Thierno Souleymane Bah',
  '+22462403902',
  'courier',
  'GN',
  'coyah',
  'fr',
  'DLV-0001',
  1001,
  false
) ON CONFLICT (user_id) DO NOTHING;

-- Now fix the handle_new_user_signup function to properly handle vehicle_type casting
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  generated_readable_id TEXT;
  generated_vest_number INTEGER;
BEGIN
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
    vest_number
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
    COALESCE(NEW.raw_user_meta_data->>'country', ''),
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    -- Properly cast vehicle_type if it exists
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
    generated_vest_number
  );
  
  -- Create wallet for new user
  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Error in handle_new_user_signup: %', SQLERRM;
    RETURN NEW;
END;
$function$;