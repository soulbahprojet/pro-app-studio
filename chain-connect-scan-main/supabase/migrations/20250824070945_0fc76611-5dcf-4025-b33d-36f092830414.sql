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
('PLN', 'Polish Zloty', 'zł', 2, 'PL', 'Poland', 'active', false),
('CZK', 'Czech Koruna', 'Kč', 2, 'CZ', 'Czech Republic', 'active', false),
('HUF', 'Hungarian Forint', 'Ft', 2, 'HU', 'Hungary', 'active', false),
('RON', 'Romanian Leu', 'lei', 2, 'RO', 'Romania', 'active', false),
('BGN', 'Bulgarian Lev', 'лв', 2, 'BG', 'Bulgaria', 'active', false),
('HRK', 'Croatian Kuna', 'kn', 2, 'HR', 'Croatia', 'active', false),
('ISK', 'Icelandic Krona', 'kr', 0, 'IS', 'Iceland', 'active', false),
('TRY', 'Turkish Lira', '₺', 2, 'TR', 'Turkey', 'active', false),
('ILS', 'Israeli Shekel', '₪', 2, 'IL', 'Israel', 'active', false),
('AED', 'UAE Dirham', 'د.إ', 2, 'AE', 'UAE', 'active', false),
('SAR', 'Saudi Riyal', '﷼', 2, 'SA', 'Saudi Arabia', 'active', false),
('QAR', 'Qatari Riyal', '﷼', 2, 'QA', 'Qatar', 'active', false),
('KWD', 'Kuwaiti Dinar', 'KD', 3, 'KW', 'Kuwait', 'active', false),
('BHD', 'Bahraini Dinar', 'BD', 3, 'BH', 'Bahrain', 'active', false),
('OMR', 'Omani Rial', '﷼', 3, 'OM', 'Oman', 'active', false),
('JOD', 'Jordanian Dinar', 'JD', 3, 'JO', 'Jordan', 'active', false),
('LBP', 'Lebanese Pound', 'L£', 2, 'LB', 'Lebanon', 'active', false),
('PKR', 'Pakistani Rupee', '₨', 2, 'PK', 'Pakistan', 'active', false),
('BDT', 'Bangladeshi Taka', '৳', 2, 'BD', 'Bangladesh', 'active', false),
('LKR', 'Sri Lankan Rupee', '₨', 2, 'LK', 'Sri Lanka', 'active', false),
('NPR', 'Nepalese Rupee', '₨', 2, 'NP', 'Nepal', 'active', false),
('MVR', 'Maldivian Rufiyaa', 'Rf', 2, 'MV', 'Maldives', 'active', false),
('THB', 'Thai Baht', '฿', 2, 'TH', 'Thailand', 'active', false),
('MYR', 'Malaysian Ringgit', 'RM', 2, 'MY', 'Malaysia', 'active', false),
('IDR', 'Indonesian Rupiah', 'Rp', 2, 'ID', 'Indonesia', 'active', false),
('PHP', 'Philippine Peso', '₱', 2, 'PH', 'Philippines', 'active', false),
('VND', 'Vietnamese Dong', '₫', 0, 'VN', 'Vietnam', 'active', false),
('LAK', 'Lao Kip', '₭', 2, 'LA', 'Laos', 'active', false),
('KHR', 'Cambodian Riel', '៛', 2, 'KH', 'Cambodia', 'active', false),
('MMK', 'Myanmar Kyat', 'K', 2, 'MM', 'Myanmar', 'active', false),
('BND', 'Brunei Dollar', 'B$', 2, 'BN', 'Brunei', 'active', false),
('TWD', 'Taiwan Dollar', 'NT$', 2, 'TW', 'Taiwan', 'active', false),
('MOP', 'Macanese Pataca', 'MOP$', 2, 'MO', 'Macau', 'active', false),
('NZD', 'New Zealand Dollar', 'NZ$', 2, 'NZ', 'New Zealand', 'active', false),
('FJD', 'Fijian Dollar', 'FJ$', 2, 'FJ', 'Fiji', 'active', false),

-- Crypto currencies (optional)
('BTC', 'Bitcoin', '₿', 8, NULL, 'Digital Currency', 'active', true),
('ETH', 'Ethereum', 'Ξ', 18, NULL, 'Digital Currency', 'active', true),
('USDT', 'Tether', 'USDT', 6, NULL, 'Digital Currency', 'active', true);