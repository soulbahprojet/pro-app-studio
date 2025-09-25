-- Fix the handle_new_user_signup function to properly cast role to user_role enum
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
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
    language
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
    NEW.raw_user_meta_data->>'vehicle_type',
    NEW.raw_user_meta_data->>'union_type',
    COALESCE((NEW.raw_user_meta_data->>'gps_verified')::boolean, false),
    NEW.raw_user_meta_data->>'gps_country',
    'fr'
  );
  RETURN NEW;
END;
$function$;