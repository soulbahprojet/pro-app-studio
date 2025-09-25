-- Fix migration by dropping existing policies first
DROP POLICY IF EXISTS "Couriers can request transfers" ON public.id_transfers;
DROP POLICY IF EXISTS "Couriers can view their transfers" ON public.id_transfers;
DROP POLICY IF EXISTS "Union leaders can manage transfers" ON public.id_transfers;

-- Now recreate the policies
CREATE POLICY "Couriers can request transfers" ON public.id_transfers
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = courier_id);

CREATE POLICY "Couriers can view their transfers" ON public.id_transfers
FOR SELECT TO authenticated
USING (auth.uid() = courier_id);

CREATE POLICY "Union leaders can manage transfers" ON public.id_transfers
FOR ALL TO authenticated
USING (
  from_union_id IN (SELECT id FROM unions WHERE leader_id = auth.uid()) OR
  to_union_id IN (SELECT id FROM unions WHERE leader_id = auth.uid())
);