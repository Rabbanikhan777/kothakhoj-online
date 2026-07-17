DROP POLICY IF EXISTS "profiles public read" ON public.profiles;
REVOKE SELECT ON public.profiles FROM anon;
CREATE POLICY "users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "admins read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));