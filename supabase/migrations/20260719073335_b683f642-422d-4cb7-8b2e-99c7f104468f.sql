DROP POLICY IF EXISTS "auth read active properties" ON public.properties;
CREATE POLICY "auth read active properties" ON public.properties FOR SELECT TO authenticated
USING (status = ANY (ARRAY['active'::property_status, 'pending'::property_status, 'sold'::property_status, 'rented'::property_status, 'unavailable'::property_status]));