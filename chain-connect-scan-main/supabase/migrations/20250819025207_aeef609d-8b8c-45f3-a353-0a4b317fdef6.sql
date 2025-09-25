-- Create the missing user_role enum type
CREATE TYPE public.user_role AS ENUM ('client', 'seller', 'courier', 'transitaire', 'admin');

-- Verify the profiles table exists and uses the correct type
-- Update the profiles table to use the enum properly if needed
ALTER TABLE public.profiles ALTER COLUMN role TYPE user_role USING role::user_role;