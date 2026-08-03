CREATE OR REPLACE VIEW public.properties_public
WITH (security_invoker = false) AS
SELECT id, owner_id, title, description, listing_type, property_type, price,
       bedrooms, bathrooms, area_sqft, city, district, address, image_url,
       images, amenities, status, featured, created_at, updated_at
FROM public.properties
WHERE status = ANY (ARRAY['active'::property_status,'pending'::property_status,'sold'::property_status,'rented'::property_status,'unavailable'::property_status]);

GRANT SELECT ON public.properties_public TO anon, authenticated;
GRANT ALL ON public.properties_public TO service_role;