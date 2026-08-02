DROP POLICY IF EXISTS "anon read public properties" ON public.properties;
REVOKE ALL ON public.properties FROM anon;