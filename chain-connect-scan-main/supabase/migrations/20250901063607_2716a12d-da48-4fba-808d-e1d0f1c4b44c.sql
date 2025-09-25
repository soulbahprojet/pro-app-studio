-- Fix security definer view issue by recreating the security_stats view with SECURITY INVOKER
-- This ensures that the view uses the permissions of the querying user, not the view creator

-- Drop the existing view
DROP VIEW IF EXISTS public.security_stats;

-- Recreate the view with SECURITY INVOKER (default behavior)
CREATE VIEW public.security_stats 
WITH (security_invoker = true)
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

-- Add RLS policy to the view if needed
ALTER VIEW public.security_stats ENABLE ROW LEVEL SECURITY;

-- Create a policy that only allows admins to view security stats
CREATE POLICY "Only admins can view security stats" ON public.security_stats
FOR SELECT USING (private.user_has_role('admin'::text));