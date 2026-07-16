
-- Roles enum + user_roles
CREATE TYPE public.app_role AS ENUM ('user', 'agent', 'admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  avatar_url text,
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles public read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "users insert own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Auto-create profile + default user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Properties
CREATE TYPE public.listing_type AS ENUM ('sale', 'rent');
CREATE TYPE public.property_type AS ENUM ('house', 'apartment', 'land', 'commercial', 'villa', 'room');
CREATE TYPE public.property_status AS ENUM ('active', 'pending', 'sold', 'rented', 'draft');

CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  listing_type listing_type NOT NULL,
  property_type property_type NOT NULL,
  price numeric NOT NULL,
  bedrooms int DEFAULT 0,
  bathrooms int DEFAULT 0,
  area_sqft numeric,
  city text NOT NULL,
  district text NOT NULL,
  address text,
  image_url text,
  images jsonb DEFAULT '[]'::jsonb,
  amenities jsonb DEFAULT '[]'::jsonb,
  status property_status NOT NULL DEFAULT 'active',
  featured boolean NOT NULL DEFAULT false,
  contact_name text,
  contact_phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.properties TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read active properties" ON public.properties FOR SELECT
  USING (status IN ('active','pending','sold','rented'));
CREATE POLICY "owners read own properties" ON public.properties FOR SELECT TO authenticated
  USING (auth.uid() = owner_id);
CREATE POLICY "admins read all properties" ON public.properties FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "authenticated insert own property" ON public.properties FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "owner update own property" ON public.properties FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "owner delete own property" ON public.properties FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);
CREATE POLICY "admin manage properties" ON public.properties FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_properties_listing_type ON public.properties(listing_type);
CREATE INDEX idx_properties_city ON public.properties(city);
CREATE INDEX idx_properties_district ON public.properties(district);
CREATE INDEX idx_properties_price ON public.properties(price);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed 15 demo properties (owner_id NULL = demo listings)
INSERT INTO public.properties
  (title, description, listing_type, property_type, price, bedrooms, bathrooms, area_sqft, city, district, address, image_url, featured, contact_name, contact_phone)
VALUES
  ('Modern 3BHK Apartment in Baneshwor', 'Bright, airy 3BHK with balcony and mountain views. Close to schools and shopping.', 'sale', 'apartment', 18500000, 3, 2, 1450, 'Kathmandu', 'Kathmandu', 'New Baneshwor, Kathmandu', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200', true, 'Rajesh Sharma', '+977-9800000001'),
  ('Elegant Villa in Lakeside', 'Spacious 5-bedroom villa steps from Phewa Lake. Private garden and lake views.', 'sale', 'villa', 62000000, 5, 4, 4200, 'Pokhara', 'Kaski', 'Lakeside-6, Pokhara', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200', true, 'Anita Gurung', '+977-9800000002'),
  ('Cozy 2BHK for Rent in Jhamsikhel', 'Fully furnished 2BHK in a quiet neighborhood. Ideal for expats.', 'rent', 'apartment', 55000, 2, 2, 950, 'Lalitpur', 'Lalitpur', 'Jhamsikhel, Lalitpur', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200', true, 'Suman Maharjan', '+977-9800000003'),
  ('Commercial Space in Durbarmarg', 'Prime location commercial floor, 2200 sqft, ideal for boutique or cafe.', 'rent', 'commercial', 250000, 0, 2, 2200, 'Kathmandu', 'Kathmandu', 'Durbarmarg, Kathmandu', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200', false, 'Bipin Shrestha', '+977-9800000004'),
  ('Ropani Land in Bhaisepati', 'Level, road-touching residential land, 1 ropani. Great for building your home.', 'sale', 'land', 42000000, 0, 0, 5476, 'Lalitpur', 'Lalitpur', 'Bhaisepati, Lalitpur', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200', false, 'Kamal Thapa', '+977-9800000005'),
  ('Modern House in Budhanilkantha', 'Newly built 4BHK house with garden, garage and solar power backup.', 'sale', 'house', 38000000, 4, 3, 2600, 'Kathmandu', 'Kathmandu', 'Budhanilkantha, Kathmandu', 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200', true, 'Nisha Karki', '+977-9800000006'),
  ('Studio Room for Rent in Thamel', 'Compact studio room, walking distance to Thamel restaurants and bars.', 'rent', 'room', 18000, 1, 1, 350, 'Kathmandu', 'Kathmandu', 'Thamel, Kathmandu', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200', false, 'Dipesh Rai', '+977-9800000007'),
  ('Bungalow in Dhulikhel', 'Peaceful 3BHK bungalow with panoramic Himalayan views.', 'sale', 'house', 27500000, 3, 2, 1800, 'Dhulikhel', 'Kavre', 'Dhulikhel, Kavre', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200', false, 'Manisha Basnet', '+977-9800000008'),
  ('Luxury Penthouse in Sanepa', 'Top-floor 4BHK penthouse, private terrace, gym & pool in building.', 'rent', 'apartment', 180000, 4, 4, 2800, 'Lalitpur', 'Lalitpur', 'Sanepa, Lalitpur', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200', true, 'Ashish Pradhan', '+977-9800000009'),
  ('Farmhouse in Nagarkot', 'Charming 3BHK farmhouse on 8 anna land with sunrise views.', 'sale', 'house', 22000000, 3, 2, 1600, 'Nagarkot', 'Bhaktapur', 'Nagarkot, Bhaktapur', 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1200', false, 'Rekha Adhikari', '+977-9800000010'),
  ('Shop Space in New Road', 'Ground-floor shop, ideal for retail, 600 sqft with high footfall.', 'rent', 'commercial', 120000, 0, 1, 600, 'Kathmandu', 'Kathmandu', 'New Road, Kathmandu', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200', false, 'Suresh KC', '+977-9800000011'),
  ('Family House in Kalanki', 'Solid 4BHK family home with rooftop, garage and garden.', 'sale', 'house', 31000000, 4, 3, 2100, 'Kathmandu', 'Kathmandu', 'Kalanki, Kathmandu', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200', false, 'Pramod Lama', '+977-9800000012'),
  ('2BHK Apartment near Fewa Lake', 'Modern 2BHK apartment 5 min walk from Fewa Lake.', 'rent', 'apartment', 42000, 2, 2, 1050, 'Pokhara', 'Kaski', 'Baidam, Pokhara', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200', false, 'Sushmita Bhandari', '+977-9800000013'),
  ('8 Anna Land in Chitwan', 'Flat 8 anna plot near highway, great for guesthouse or resort.', 'sale', 'land', 15000000, 0, 0, 2738, 'Bharatpur', 'Chitwan', 'Bharatpur-10, Chitwan', 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1200', false, 'Ram Chaudhary', '+977-9800000014'),
  ('Duplex Villa in Bhaktapur', 'Beautiful duplex with 4 bedrooms, traditional Newari architecture.', 'sale', 'villa', 48500000, 4, 3, 3200, 'Bhaktapur', 'Bhaktapur', 'Suryabinayak, Bhaktapur', 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200', true, 'Kabita Shrestha', '+977-9800000015');
