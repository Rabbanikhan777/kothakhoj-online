-- Remove anonymous access to the properties table entirely; anon reads go through properties_public view
DROP POLICY IF EXISTS "public read active properties (no contact)" ON public.properties;

REVOKE ALL ON public.properties FROM anon;

-- Ensure the sanitized view is the only anon read path
GRANT SELECT ON public.properties_public TO anon, authenticated;