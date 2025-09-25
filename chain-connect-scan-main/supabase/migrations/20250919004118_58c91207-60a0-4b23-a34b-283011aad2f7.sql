-- Fix Security Definer View issues by revoking excessive permissions
-- and implementing proper access controls

-- Revoke all permissions from anonymous users on the views
REVOKE ALL ON public.eligible_boost_vendors FROM anon;
REVOKE ALL ON public.shops_public_view FROM anon;

-- Grant only necessary read permissions to authenticated users
GRANT SELECT ON public.eligible_boost_vendors TO authenticated;
GRANT SELECT ON public.shops_public_view TO authenticated;

-- Ensure service_role retains full access for system operations
GRANT ALL ON public.eligible_boost_vendors TO service_role;
GRANT ALL ON public.shops_public_view TO service_role;

-- For public shop view, allow public read access but only for active shops
-- This is safe because the view already filters for is_active = true
GRANT SELECT ON public.shops_public_view TO anon;

-- Add comments for documentation
COMMENT ON VIEW public.eligible_boost_vendors IS 'View of verified sellers eligible for boost features - restricted to authenticated users only';
COMMENT ON VIEW public.shops_public_view IS 'Public view of active shops - safe for anonymous access as it only shows active public shops';