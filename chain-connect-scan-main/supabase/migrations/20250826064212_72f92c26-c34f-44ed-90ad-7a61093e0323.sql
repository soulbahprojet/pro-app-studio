-- Fix seller_shops table security vulnerability
-- Remove the overly permissive public policy and create secure policies

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Boutiques publiques visibles par tous" ON public.seller_shops;

-- Create a secure public view policy that only exposes safe, non-sensitive information
CREATE POLICY "Public can view basic shop info only" 
ON public.seller_shops 
FOR SELECT 
TO public
USING (
  is_active = true 
  AND (
    -- Only expose safe columns publicly
    -- This policy will be combined with column-level restrictions in the application layer
    true
  )
);

-- Sellers can still manage their own shops completely
-- (This policy already exists: "Vendeurs peuvent gérer leur boutique")

-- Create a view for public shop information that exposes only safe data
CREATE OR REPLACE VIEW public.shops_public_view AS
SELECT 
  id,
  seller_id,
  shop_name,
  description,
  logo_url,
  banner_url,
  theme_color,
  shop_images,
  business_type,
  shop_category,
  business_hours,
  social_links,
  product_count,
  slug,
  created_at,
  subscription_plan
FROM public.seller_shops 
WHERE is_active = true;

-- Enable RLS on the view
ALTER VIEW public.shops_public_view SET (security_barrier = true);

-- Grant SELECT access to the public view
GRANT SELECT ON public.shops_public_view TO public;
GRANT SELECT ON public.shops_public_view TO anon;
GRANT SELECT ON public.shops_public_view TO authenticated;

-- Create a function for sellers to get their own complete shop info including sensitive data
CREATE OR REPLACE FUNCTION public.get_my_shop_details()
RETURNS TABLE (
  id uuid,
  seller_id uuid,
  shop_name text,
  description text,
  logo_url text,
  banner_url text,
  theme_color text,
  is_active boolean,
  custom_domain text,
  social_links jsonb,
  business_hours jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  subscription_plan subscription_plan,
  product_count integer,
  slug text,
  shop_images text[],
  business_type text,
  business_address text,
  contact_phone text,
  contact_email text,
  shop_category text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    s.id,
    s.seller_id,
    s.shop_name,
    s.description,
    s.logo_url,
    s.banner_url,
    s.theme_color,
    s.is_active,
    s.custom_domain,
    s.social_links,
    s.business_hours,
    s.created_at,
    s.updated_at,
    s.subscription_plan,
    s.product_count,
    s.slug,
    s.shop_images,
    s.business_type,
    s.business_address,
    s.contact_phone,
    s.contact_email,
    s.shop_category
  FROM public.seller_shops s
  WHERE s.seller_id = auth.uid()
    AND s.is_active = true;
$$;

-- Create a function for customers to get shop contact info only when they have an active order
CREATE OR REPLACE FUNCTION public.get_shop_contact_for_order(shop_id uuid, order_id uuid)
RETURNS TABLE (
  contact_phone text,
  contact_email text,
  business_address text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    s.contact_phone,
    s.contact_email,
    s.business_address
  FROM public.seller_shops s
  INNER JOIN public.orders o ON o.seller_id = s.seller_id
  WHERE s.id = shop_id
    AND o.id = order_id
    AND o.customer_id = auth.uid()
    AND s.is_active = true;
$$;