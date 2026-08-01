-- 1) Allow anonymous visitors to browse public listings
CREATE POLICY "anon read public properties"
ON public.properties
FOR SELECT
TO anon
USING (status = ANY (ARRAY['active'::property_status,'pending'::property_status,'sold'::property_status,'rented'::property_status,'unavailable'::property_status]));

-- Restrict anon to non-sensitive columns only (no contact details / street address)
REVOKE SELECT ON public.properties FROM anon;
GRANT SELECT (
  id, title, description, city, district, price, listing_type, property_type,
  bedrooms, bathrooms, area_sqft, amenities, image_url, images, status,
  featured, created_at, updated_at
) ON public.properties TO anon;

-- 2) Defense in depth: only admins may assign or change roles
CREATE OR REPLACE FUNCTION public.enforce_admin_role_management()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only administrators can manage user roles';
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS enforce_admin_role_management ON public.user_roles;
CREATE TRIGGER enforce_admin_role_management
BEFORE INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.enforce_admin_role_management();