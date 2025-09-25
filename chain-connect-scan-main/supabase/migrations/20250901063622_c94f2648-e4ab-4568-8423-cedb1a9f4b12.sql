-- Fix Security Definer View issue by converting security_stats to use SECURITY INVOKER
-- This ensures the view runs with the permissions of the querying user, not the view creator

-- Drop the existing view
DROP VIEW IF EXISTS public.security_stats;

-- Recreate the view with SECURITY INVOKER
CREATE VIEW public.security_stats
WITH (security_invoker = on)
AS SELECT 
    date_trunc('day'::text, created_at) AS date,
    severity,
    action_type,
    count(*) AS event_count
FROM audit_logs
WHERE private.user_has_role('admin'::text)
GROUP BY (date_trunc('day'::text, created_at)), severity, action_type
ORDER BY (date_trunc('day'::text, created_at)) DESC;