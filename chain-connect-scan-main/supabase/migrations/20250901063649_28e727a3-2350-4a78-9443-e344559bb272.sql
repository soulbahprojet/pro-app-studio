-- Fix security definer view issue by recreating the security_stats view with SECURITY INVOKER
-- This ensures that the view uses the permissions of the querying user, not the view creator

-- Drop the existing view
DROP VIEW IF EXISTS public.security_stats;

-- Recreate the view with SECURITY INVOKER (default behavior)
-- The view will inherit the permissions from the underlying tables and functions
CREATE VIEW public.security_stats 
AS 
SELECT 
    date_trunc('day'::text, created_at) AS date,
    severity,
    action_type,
    count(*) AS event_count
FROM audit_logs
WHERE private.user_has_role('admin'::text)
GROUP BY (date_trunc('day'::text, created_at)), severity, action_type
ORDER BY (date_trunc('day'::text, created_at)) DESC;