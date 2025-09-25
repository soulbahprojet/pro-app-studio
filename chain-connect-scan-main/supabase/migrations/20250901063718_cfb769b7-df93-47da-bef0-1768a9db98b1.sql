-- Fix security definer view issue by recreating the security_stats view with SECURITY INVOKER
-- This ensures that the view uses the permissions of the querying user, not the view creator

-- Drop the existing view
DROP VIEW IF EXISTS public.security_stats;

-- Recreate the view with SECURITY INVOKER (default behavior)
-- Views inherit the security context of the querying user by default when created this way
CREATE VIEW public.security_stats AS 
SELECT 
    date_trunc('day'::text, al.created_at) AS date,
    al.severity,
    al.action_type,
    count(*) AS event_count
FROM public.audit_logs al
WHERE private.user_has_role('admin'::text)
GROUP BY (date_trunc('day'::text, al.created_at)), al.severity, al.action_type
ORDER BY (date_trunc('day'::text, al.created_at)) DESC;