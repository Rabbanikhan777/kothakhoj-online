DROP POLICY IF EXISTS "anon read public properties" ON public.properties;
REVOKE ALL ON public.properties FROM anon;

ALTER VIEW public.properties_public SET (security_invoker = false);
GRANT SELECT ON public.properties_public TO anon, authenticated;