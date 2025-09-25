-- Add missing columns to seller_shops table
ALTER TABLE public.seller_shops 
ADD COLUMN business_type TEXT,
ADD COLUMN business_address TEXT,
ADD COLUMN contact_phone TEXT,
ADD COLUMN contact_email TEXT,
ADD COLUMN shop_category TEXT;