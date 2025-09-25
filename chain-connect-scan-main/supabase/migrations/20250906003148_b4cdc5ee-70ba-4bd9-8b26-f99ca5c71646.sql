-- Fix Security Definer Views Issue
-- Convert SECURITY DEFINER table functions to SECURITY INVOKER to respect user permissions and RLS

-- 1. Fix get_my_shop_details function
-- This function should use SECURITY INVOKER since it only returns data the authenticated user should see
CREATE OR REPLACE FUNCTION public.get_my_shop_details()
RETURNS TABLE(
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
    created_at timestamp with time zone, 
    updated_at timestamp with time zone, 
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
STABLE
SECURITY INVOKER  -- Changed from SECURITY DEFINER to SECURITY INVOKER
SET search_path = public
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

-- 2. Fix get_shop_contact_for_order function  
-- This function should use SECURITY INVOKER since it should respect RLS policies
CREATE OR REPLACE FUNCTION public.get_shop_contact_for_order(shop_id uuid, order_id uuid)
RETURNS TABLE(contact_phone text, contact_email text, business_address text)
LANGUAGE sql
STABLE
SECURITY INVOKER  -- Changed from SECURITY DEFINER to SECURITY INVOKER
SET search_path = public
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

-- 3. Fix get_warehouse_public_info function
-- This function can remain SECURITY DEFINER since it only returns public information
-- but we'll add better validation
CREATE OR REPLACE FUNCTION public.get_warehouse_public_info(warehouse_id uuid)
RETURNS TABLE(id uuid, name text, country text, is_active boolean)
LANGUAGE sql
STABLE
SECURITY INVOKER  -- Changed to SECURITY INVOKER since it's public data
SET search_path = public
AS $$
    SELECT w.id, w.name, w.country, w.is_active
    FROM warehouses w
    WHERE w.id = warehouse_id AND w.is_active = true;
$$;

-- 4. Fix detect_suspicious_activity function
-- This function should only be accessible to admins and use proper access control
CREATE OR REPLACE FUNCTION public.detect_suspicious_activity()
RETURNS TABLE(user_id uuid, suspicious_events bigint, last_violation timestamp with time zone)
LANGUAGE sql
STABLE
SECURITY INVOKER  -- Changed from SECURITY DEFINER to SECURITY INVOKER
SET search_path = public
AS $$
    -- Only allow admin users to access this function
    SELECT 
        al.user_id,
        COUNT(*) as suspicious_events,
        MAX(al.created_at) as last_violation
    FROM public.audit_logs al
    WHERE al.severity IN ('WARNING', 'CRITICAL')
      AND al.created_at > now() - INTERVAL '24 hours'
      -- Ensure only admin users can access this data by checking admin role
      AND EXISTS (
          SELECT 1 FROM public.admin_roles ar 
          WHERE ar.user_id = auth.uid() 
          AND ar.role_type = 'admin'
      )
    GROUP BY al.user_id
    HAVING COUNT(*) > 5
    ORDER BY suspicious_events DESC;
$$;

-- Add a comment explaining the security change
COMMENT ON FUNCTION public.get_my_shop_details() IS 
'Returns shop details for the authenticated user. Uses SECURITY INVOKER to respect RLS policies.';

COMMENT ON FUNCTION public.get_shop_contact_for_order(uuid, uuid) IS 
'Returns shop contact info for orders. Uses SECURITY INVOKER to respect user permissions.';

COMMENT ON FUNCTION public.get_warehouse_public_info(uuid) IS 
'Returns public warehouse information. Uses SECURITY INVOKER for public data access.';

COMMENT ON FUNCTION public.detect_suspicious_activity() IS 
'Returns suspicious activity data for admin users only. Uses SECURITY INVOKER with admin check.';

-- Grant necessary permissions for the functions to work properly
GRANT EXECUTE ON FUNCTION public.get_my_shop_details() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_shop_contact_for_order(uuid, uuid) TO authenticated;  
GRANT EXECUTE ON FUNCTION public.get_warehouse_public_info(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.detect_suspicious_activity() TO authenticated;