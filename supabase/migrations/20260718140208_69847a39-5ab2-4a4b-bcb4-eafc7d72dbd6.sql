-- Convert has_role from SECURITY DEFINER to SECURITY INVOKER.
-- The existing "read own roles" SELECT policy on user_roles already allows
-- each authenticated user to read their own role rows, so has_role works
-- correctly as INVOKER (no recursion, no privilege escalation).
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Restrict public read on properties to non-sensitive columns via a safe view,
-- and remove contact_name / contact_phone from the anonymous SELECT surface.
DROP POLICY IF EXISTS "public read active properties" ON public.properties;

CREATE POLICY "public read active properties (no contact)"
ON public.properties
FOR SELECT
TO anon
USING (
  status = ANY (ARRAY['active'::property_status, 'pending'::property_status, 'sold'::property_status, 'rented'::property_status])
);

-- Authenticated users can still read active listings (including contact info,
-- which is reasonable for logged-in prospective buyers/renters).
CREATE POLICY "auth read active properties"
ON public.properties
FOR SELECT
TO authenticated
USING (
  status = ANY (ARRAY['active'::property_status, 'pending'::property_status, 'sold'::property_status, 'rented'::property_status])
);

-- Create a public-safe view that omits contact_name and contact_phone for anon reads.
CREATE OR REPLACE VIEW public.properties_public AS
SELECT
  id, owner_id, title, description, listing_type, property_type, price,
  bedrooms, bathrooms, area_sqft, city, district, address, image_url,
  images, amenities, status, featured, created_at, updated_at
FROM public.properties
WHERE status = ANY (ARRAY['active'::property_status, 'pending'::property_status, 'sold'::property_status, 'rented'::property_status]);

GRANT SELECT ON public.properties_public TO anon, authenticated;

-- Strip anon's ability to read contact columns directly on the base table
-- by revoking the broad SELECT and re-granting only non-contact columns.
REVOKE SELECT ON public.properties FROM anon;
GRANT SELECT (
  id, owner_id, title, description, listing_type, property_type, price,
  bedrooms, bathrooms, area_sqft, city, district, address, image_url,
  images, amenities, status, featured, created_at, updated_at
) ON public.properties TO anon;