ALTER VIEW public.properties_public SET (security_invoker = true);

CREATE POLICY "anon read public listings" ON public.properties
  FOR SELECT TO anon
  USING (status = ANY (ARRAY['active'::property_status,'pending'::property_status,'sold'::property_status,'rented'::property_status,'unavailable'::property_status]));

REVOKE ALL ON public.properties FROM anon;
GRANT SELECT (id, owner_id, title, description, listing_type, property_type, price, bedrooms, bathrooms, area_sqft, city, district, address, image_url, images, amenities, status, featured, created_at, updated_at)
  ON public.properties TO anon;