-- Add shop_images column to seller_shops table for image collection management
ALTER TABLE public.seller_shops 
ADD COLUMN shop_images TEXT[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN public.seller_shops.shop_images IS 'Collection of images URLs for shop motion design and presentation';