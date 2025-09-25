-- Créer une table pour associer les pays à leurs devises par défaut
CREATE TABLE IF NOT EXISTS public.country_currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code VARCHAR(2) NOT NULL UNIQUE, -- Code ISO 3166-1 alpha-2
  country_name VARCHAR(100) NOT NULL,
  default_currency VARCHAR(3) NOT NULL, -- Code ISO 4217
  currency_name VARCHAR(100) NOT NULL,
  currency_symbol VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.country_currencies ENABLE ROW LEVEL SECURITY;

-- Politique pour lecture publique
CREATE POLICY "Country currencies are readable by everyone" 
ON public.country_currencies 
FOR SELECT 
USING (true);

-- Politique pour les admins seulement pour modification
CREATE POLICY "Only admins can modify country currencies" 
ON public.country_currencies 
FOR ALL 
USING (is_pdg_user())
WITH CHECK (is_pdg_user());

-- Insérer les associations pays-devises pour l'Afrique de l'Ouest et autres
INSERT INTO public.country_currencies (country_code, country_name, default_currency, currency_name, currency_symbol) VALUES
-- Afrique de l'Ouest
('GN', 'Guinea', 'GNF', 'Franc Guinéen', 'GNF'),
('SN', 'Senegal', 'XOF', 'Franc CFA', 'FCFA'),
('ML', 'Mali', 'XOF', 'Franc CFA', 'FCFA'),
('BF', 'Burkina Faso', 'XOF', 'Franc CFA', 'FCFA'),
('CI', 'Côte d''Ivoire', 'XOF', 'Franc CFA', 'FCFA'),
('BJ', 'Benin', 'XOF', 'Franc CFA', 'FCFA'),
('TG', 'Togo', 'XOF', 'Franc CFA', 'FCFA'),
('NE', 'Niger', 'XOF', 'Franc CFA', 'FCFA'),

-- Afrique Centrale
('CM', 'Cameroon', 'XAF', 'Franc CFA Central', 'FCFA'),
('CF', 'Central African Republic', 'XAF', 'Franc CFA Central', 'FCFA'),
('TD', 'Chad', 'XAF', 'Franc CFA Central', 'FCFA'),
('CG', 'Congo', 'XAF', 'Franc CFA Central', 'FCFA'),
('CD', 'Democratic Republic of Congo', 'XAF', 'Franc CFA Central', 'FCFA'),
('GQ', 'Equatorial Guinea', 'XAF', 'Franc CFA Central', 'FCFA'),
('GA', 'Gabon', 'XAF', 'Franc CFA Central', 'FCFA'),

-- Autres pays africains
('NG', 'Nigeria', 'NGN', 'Naira Nigérian', '₦'),
('GH', 'Ghana', 'GHS', 'Cedi Ghanéen', 'GH₵'),
('KE', 'Kenya', 'KES', 'Shilling Kenyan', 'KSh'),
('ZA', 'South Africa', 'ZAR', 'Rand Sud-Africain', 'R'),
('MA', 'Morocco', 'MAD', 'Dirham Marocain', 'DH'),
('EG', 'Egypt', 'EGP', 'Livre Égyptienne', 'E£'),

-- Pays développés/internationaux
('US', 'United States', 'USD', 'Dollar US', '$'),
('GB', 'United Kingdom', 'GBP', 'Livre Sterling', '£'),
('FR', 'France', 'EUR', 'Euro', '€'),
('DE', 'Germany', 'EUR', 'Euro', '€'),
('ES', 'Spain', 'EUR', 'Euro', '€'),
('IT', 'Italy', 'EUR', 'Euro', '€'),
('CA', 'Canada', 'CAD', 'Dollar Canadien', 'C$'),
('CH', 'Switzerland', 'CHF', 'Franc Suisse', 'CHF'),
('JP', 'Japan', 'JPY', 'Yen Japonais', '¥'),
('CN', 'China', 'CNY', 'Yuan Chinois', '¥'),
('AU', 'Australia', 'AUD', 'Dollar Australien', 'A$'),
('BR', 'Brazil', 'BRL', 'Real Brésilien', 'R$'),
('IN', 'India', 'INR', 'Roupie Indienne', '₹'),
('RU', 'Russia', 'RUB', 'Rouble Russe', '₽')

ON CONFLICT (country_code) DO UPDATE SET
  country_name = EXCLUDED.country_name,
  default_currency = EXCLUDED.default_currency,
  currency_name = EXCLUDED.currency_name,
  currency_symbol = EXCLUDED.currency_symbol,
  updated_at = now();

-- Fonction pour obtenir la devise par défaut d'un pays
CREATE OR REPLACE FUNCTION public.get_country_default_currency(country_code TEXT)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT default_currency 
  FROM public.country_currencies 
  WHERE country_code = UPPER(get_country_default_currency.country_code)
  LIMIT 1;
$$;

-- Mettre à jour la fonction de gestion des nouveaux utilisateurs
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
    preferred_currency -- Assigner la devise par défaut selon le pays
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
    generated_vest_number,
    default_currency -- Devise par défaut selon le pays
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
$$;