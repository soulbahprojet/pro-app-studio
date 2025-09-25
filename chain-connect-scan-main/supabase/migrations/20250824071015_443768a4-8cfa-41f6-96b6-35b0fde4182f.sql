-- Create currencies table with all world currencies
CREATE TYPE currency_status AS ENUM ('active', 'inactive', 'deprecated');

CREATE TABLE public.currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(3) UNIQUE NOT NULL, -- ISO 4217 code (USD, EUR, GNF, etc.)
  name VARCHAR(100) NOT NULL, -- Full name (US Dollar, Euro, etc.)
  symbol VARCHAR(20) NOT NULL, -- Currency symbol ($, €, GNF, etc.) - increased size
  decimal_places INTEGER DEFAULT 2, -- Number of decimal places
  country_code VARCHAR(2), -- ISO country code
  country_name VARCHAR(100),
  status currency_status DEFAULT 'active',
  is_crypto BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert world currencies first
INSERT INTO public.currencies (code, name, symbol, decimal_places, country_code, country_name, status, is_crypto) VALUES
-- Major currencies
('USD', 'US Dollar', '$', 2, 'US', 'United States', 'active', false),
('EUR', 'Euro', '€', 2, 'EU', 'European Union', 'active', false),
('GBP', 'British Pound', '£', 2, 'GB', 'United Kingdom', 'active', false),
('JPY', 'Japanese Yen', '¥', 0, 'JP', 'Japan', 'active', false),
('CHF', 'Swiss Franc', 'CHF', 2, 'CH', 'Switzerland', 'active', false),
('CAD', 'Canadian Dollar', 'C$', 2, 'CA', 'Canada', 'active', false),
('AUD', 'Australian Dollar', 'A$', 2, 'AU', 'Australia', 'active', false),
('CNY', 'Chinese Yuan', '¥', 2, 'CN', 'China', 'active', false),

-- African currencies
('GNF', 'Guinean Franc', 'GNF', 0, 'GN', 'Guinea', 'active', false),
('XOF', 'West African CFA Franc', 'CFA', 0, 'SN', 'Senegal', 'active', false),
('XAF', 'Central African CFA Franc', 'FCFA', 0, 'CM', 'Cameroon', 'active', false),
('NGN', 'Nigerian Naira', '₦', 2, 'NG', 'Nigeria', 'active', false),
('GHS', 'Ghanaian Cedi', 'GH₵', 2, 'GH', 'Ghana', 'active', false),
('KES', 'Kenyan Shilling', 'KSh', 2, 'KE', 'Kenya', 'active', false),
('ZAR', 'South African Rand', 'R', 2, 'ZA', 'South Africa', 'active', false),
('EGP', 'Egyptian Pound', 'E£', 2, 'EG', 'Egypt', 'active', false),
('MAD', 'Moroccan Dirham', 'MAD', 2, 'MA', 'Morocco', 'active', false),
('TND', 'Tunisian Dinar', 'TND', 3, 'TN', 'Tunisia', 'active', false),
('DZD', 'Algerian Dinar', 'DA', 2, 'DZ', 'Algeria', 'active', false),
('ETB', 'Ethiopian Birr', 'Br', 2, 'ET', 'Ethiopia', 'active', false),
('UGX', 'Ugandan Shilling', 'USh', 0, 'UG', 'Uganda', 'active', false),
('TZS', 'Tanzanian Shilling', 'TSh', 2, 'TZ', 'Tanzania', 'active', false),
('MWK', 'Malawian Kwacha', 'MK', 2, 'MW', 'Malawi', 'active', false),
('ZMW', 'Zambian Kwacha', 'ZK', 2, 'ZM', 'Zambia', 'active', false),
('BWP', 'Botswana Pula', 'P', 2, 'BW', 'Botswana', 'active', false),
('MUR', 'Mauritian Rupee', '₨', 2, 'MU', 'Mauritius', 'active', false),

-- Other major world currencies
('INR', 'Indian Rupee', '₹', 2, 'IN', 'India', 'active', false),
('BRL', 'Brazilian Real', 'R$', 2, 'BR', 'Brazil', 'active', false),
('RUB', 'Russian Ruble', '₽', 2, 'RU', 'Russia', 'active', false),
('KRW', 'South Korean Won', '₩', 0, 'KR', 'South Korea', 'active', false),
('MXN', 'Mexican Peso', '$', 2, 'MX', 'Mexico', 'active', false),
('SGD', 'Singapore Dollar', 'S$', 2, 'SG', 'Singapore', 'active', false),
('HKD', 'Hong Kong Dollar', 'HK$', 2, 'HK', 'Hong Kong', 'active', false),
('NOK', 'Norwegian Krone', 'kr', 2, 'NO', 'Norway', 'active', false),
('SEK', 'Swedish Krona', 'kr', 2, 'SE', 'Sweden', 'active', false),
('DKK', 'Danish Krone', 'kr', 2, 'DK', 'Denmark', 'active', false),

-- Crypto currencies
('BTC', 'Bitcoin', '₿', 8, NULL, 'Digital Currency', 'active', true),
('ETH', 'Ethereum', 'Ξ', 18, NULL, 'Digital Currency', 'active', true),
('USDT', 'Tether', 'USDT', 6, NULL, 'Digital Currency', 'active', true);