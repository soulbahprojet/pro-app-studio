-- Add missing columns to profiles table for courier data
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS vehicle_type TEXT,
ADD COLUMN IF NOT EXISTS union_type TEXT,
ADD COLUMN IF NOT EXISTS gps_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS gps_country TEXT,
ADD COLUMN IF NOT EXISTS last_gps_check TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS vest_number INTEGER,
ADD COLUMN IF NOT EXISTS total_missions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_missions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS success_rate REAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating REAL DEFAULT 0;

-- Add check constraint for vehicle_type
ALTER TABLE public.profiles 
ADD CONSTRAINT check_vehicle_type 
CHECK (vehicle_type IS NULL OR vehicle_type IN ('moto', 'voiture'));

-- Add check constraint for union_type
ALTER TABLE public.profiles 
ADD CONSTRAINT check_union_type 
CHECK (union_type IS NULL OR union_type IN ('syndicat_moto', 'syndicat_voiture'));

-- Create function to auto-assign vest numbers for couriers
CREATE OR REPLACE FUNCTION assign_vest_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Only assign vest number for couriers if not already set
  IF NEW.role = 'courier' AND (OLD.vest_number IS NULL OR NEW.vest_number IS NULL) THEN
    -- Get the next available vest number starting from 1001
    SELECT COALESCE(MAX(vest_number), 1000) + 1 
    INTO NEW.vest_number 
    FROM public.profiles 
    WHERE role = 'courier';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vest number assignment
DROP TRIGGER IF EXISTS assign_vest_number_trigger ON public.profiles;
CREATE TRIGGER assign_vest_number_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_vest_number();

-- Create function to handle auth user signup and create profile
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
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
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_signup();