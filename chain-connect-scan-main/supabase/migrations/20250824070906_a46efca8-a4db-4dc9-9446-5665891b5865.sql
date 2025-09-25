-- Create currencies table with all world currencies
CREATE TYPE currency_status AS ENUM ('active', 'inactive', 'deprecated');

CREATE TABLE public.currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(3) UNIQUE NOT NULL, -- ISO 4217 code (USD, EUR, GNF, etc.)
  name VARCHAR(100) NOT NULL, -- Full name (US Dollar, Euro, etc.)
  symbol VARCHAR(10) NOT NULL, -- Currency symbol ($, €, GNF, etc.)
  decimal_places INTEGER DEFAULT 2, -- Number of decimal places
  country_code VARCHAR(2), -- ISO country code
  country_name VARCHAR(100),
  status currency_status DEFAULT 'active',
  is_crypto BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert world currencies first
INSERT INTO public.currencies (code, name, symbol, decimal_places, country_code, country_name) VALUES
-- Major currencies
('USD', 'US Dollar', '$', 2, 'US', 'United States'),
('EUR', 'Euro', '€', 2, 'EU', 'European Union'),
('GBP', 'British Pound', '£', 2, 'GB', 'United Kingdom'),
('JPY', 'Japanese Yen', '¥', 0, 'JP', 'Japan'),
('CHF', 'Swiss Franc', 'CHF', 2, 'CH', 'Switzerland'),
('CAD', 'Canadian Dollar', 'C$', 2, 'CA', 'Canada'),
('AUD', 'Australian Dollar', 'A$', 2, 'AU', 'Australia'),
('CNY', 'Chinese Yuan', '¥', 2, 'CN', 'China'),

-- African currencies
('GNF', 'Guinean Franc', 'GNF', 0, 'GN', 'Guinea'),
('XOF', 'West African CFA Franc', 'CFA', 0, 'SN', 'Senegal'),
('XAF', 'Central African CFA Franc', 'FCFA', 0, 'CM', 'Cameroon'),
('NGN', 'Nigerian Naira', '₦', 2, 'NG', 'Nigeria'),
('GHS', 'Ghanaian Cedi', 'GH₵', 2, 'GH', 'Ghana'),
('KES', 'Kenyan Shilling', 'KSh', 2, 'KE', 'Kenya'),
('ZAR', 'South African Rand', 'R', 2, 'ZA', 'South Africa'),
('EGP', 'Egyptian Pound', 'E£', 2, 'EG', 'Egypt'),
('MAD', 'Moroccan Dirham', 'MAD', 2, 'MA', 'Morocco'),
('TND', 'Tunisian Dinar', 'TND', 3, 'TN', 'Tunisia'),
('DZD', 'Algerian Dinar', 'DA', 2, 'DZ', 'Algeria'),
('ETB', 'Ethiopian Birr', 'Br', 2, 'ET', 'Ethiopia'),
('UGX', 'Ugandan Shilling', 'USh', 0, 'UG', 'Uganda'),
('TZS', 'Tanzanian Shilling', 'TSh', 2, 'TZ', 'Tanzania'),
('MWK', 'Malawian Kwacha', 'MK', 2, 'MW', 'Malawi'),
('ZMW', 'Zambian Kwacha', 'ZK', 2, 'ZM', 'Zambia'),
('BWP', 'Botswana Pula', 'P', 2, 'BW', 'Botswana'),
('MUR', 'Mauritian Rupee', '₨', 2, 'MU', 'Mauritius'),

-- Other major world currencies
('INR', 'Indian Rupee', '₹', 2, 'IN', 'India'),
('BRL', 'Brazilian Real', 'R$', 2, 'BR', 'Brazil'),
('RUB', 'Russian Ruble', '₽', 2, 'RU', 'Russia'),
('KRW', 'South Korean Won', '₩', 0, 'KR', 'South Korea'),
('MXN', 'Mexican Peso', '$', 2, 'MX', 'Mexico'),
('SGD', 'Singapore Dollar', 'S$', 2, 'SG', 'Singapore'),
('HKD', 'Hong Kong Dollar', 'HK$', 2, 'HK', 'Hong Kong'),
('NOK', 'Norwegian Krone', 'kr', 2, 'NO', 'Norway'),
('SEK', 'Swedish Krona', 'kr', 2, 'SE', 'Sweden'),
('DKK', 'Danish Krone', 'kr', 2, 'DK', 'Denmark'),
('PLN', 'Polish Zloty', 'zł', 2, 'PL', 'Poland'),
('CZK', 'Czech Koruna', 'Kč', 2, 'CZ', 'Czech Republic'),
('HUF', 'Hungarian Forint', 'Ft', 2, 'HU', 'Hungary'),
('RON', 'Romanian Leu', 'lei', 2, 'RO', 'Romania'),
('BGN', 'Bulgarian Lev', 'лв', 2, 'BG', 'Bulgaria'),
('HRK', 'Croatian Kuna', 'kn', 2, 'HR', 'Croatia'),
('ISK', 'Icelandic Krona', 'kr', 0, 'IS', 'Iceland'),
('TRY', 'Turkish Lira', '₺', 2, 'TR', 'Turkey'),
('ILS', 'Israeli Shekel', '₪', 2, 'IL', 'Israel'),
('AED', 'UAE Dirham', 'د.إ', 2, 'AE', 'UAE'),
('SAR', 'Saudi Riyal', '﷼', 2, 'SA', 'Saudi Arabia'),
('QAR', 'Qatari Riyal', '﷼', 2, 'QA', 'Qatar'),
('KWD', 'Kuwaiti Dinar', 'KD', 3, 'KW', 'Kuwait'),
('BHD', 'Bahraini Dinar', 'BD', 3, 'BH', 'Bahrain'),
('OMR', 'Omani Rial', '﷼', 3, 'OM', 'Oman'),
('JOD', 'Jordanian Dinar', 'JD', 3, 'JO', 'Jordan'),
('LBP', 'Lebanese Pound', 'L£', 2, 'LB', 'Lebanon'),
('PKR', 'Pakistani Rupee', '₨', 2, 'PK', 'Pakistan'),
('BDT', 'Bangladeshi Taka', '৳', 2, 'BD', 'Bangladesh'),
('LKR', 'Sri Lankan Rupee', '₨', 2, 'LK', 'Sri Lanka'),
('NPR', 'Nepalese Rupee', '₨', 2, 'NP', 'Nepal'),
('MVR', 'Maldivian Rufiyaa', 'Rf', 2, 'MV', 'Maldives'),
('THB', 'Thai Baht', '฿', 2, 'TH', 'Thailand'),
('MYR', 'Malaysian Ringgit', 'RM', 2, 'MY', 'Malaysia'),
('IDR', 'Indonesian Rupiah', 'Rp', 2, 'ID', 'Indonesia'),
('PHP', 'Philippine Peso', '₱', 2, 'PH', 'Philippines'),
('VND', 'Vietnamese Dong', '₫', 0, 'VN', 'Vietnam'),
('LAK', 'Lao Kip', '₭', 2, 'LA', 'Laos'),
('KHR', 'Cambodian Riel', '៛', 2, 'KH', 'Cambodia'),
('MMK', 'Myanmar Kyat', 'K', 2, 'MM', 'Myanmar'),
('BND', 'Brunei Dollar', 'B$', 2, 'BN', 'Brunei'),
('TWD', 'Taiwan Dollar', 'NT$', 2, 'TW', 'Taiwan'),
('MOP', 'Macanese Pataca', 'MOP$', 2, 'MO', 'Macau'),
('NZD', 'New Zealand Dollar', 'NZ$', 2, 'NZ', 'New Zealand'),
('FJD', 'Fijian Dollar', 'FJ$', 2, 'FJ', 'Fiji'),

-- Crypto currencies (optional)
('BTC', 'Bitcoin', '₿', 8, NULL, 'Digital Currency', 'active', true),
('ETH', 'Ethereum', 'Ξ', 18, NULL, 'Digital Currency', 'active', true),
('USDT', 'Tether', 'USDT', 6, NULL, 'Digital Currency', 'active', true);

-- Create exchange rates table
CREATE TABLE public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  target_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(20, 8) NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  source VARCHAR(50) DEFAULT 'exchangerate-api',
  UNIQUE(base_currency, target_currency)
);

-- Add currency preference to profiles (now that currencies exist)
ALTER TABLE public.profiles 
ADD COLUMN preferred_currency VARCHAR(3) DEFAULT 'USD' REFERENCES public.currencies(code);

-- Create user currency settings table
CREATE TABLE public.user_currency_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_currency VARCHAR(3) NOT NULL REFERENCES public.currencies(code),
  auto_convert BOOLEAN DEFAULT true,
  show_original_price BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_currency_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for currencies (readable by all)
CREATE POLICY "Currencies are readable by everyone" ON public.currencies
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage currencies" ON public.currencies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles 
      WHERE user_id = auth.uid() AND role_type = 'admin'
    )
  );

-- RLS Policies for exchange rates (readable by all)
CREATE POLICY "Exchange rates are readable by everyone" ON public.exchange_rates
  FOR SELECT USING (true);

CREATE POLICY "System can update exchange rates" ON public.exchange_rates
  FOR ALL USING (true);

-- RLS Policies for user currency settings
CREATE POLICY "Users can manage their currency settings" ON public.user_currency_settings
  FOR ALL USING (auth.uid() = user_id);