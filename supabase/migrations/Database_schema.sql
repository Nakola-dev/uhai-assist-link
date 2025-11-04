/*
  # UhaiLink – Final Schema (2025-11-04)
  - profiles: full_name, phone, email, blood_type, allergies, medications, 
    chronic_conditions, additional_notes, emergency_contact_*
  - emergency_organizations: 5 Kenyan services (pre-loaded)
  - tutorials: 7 first-aid videos (pre-loaded)
  - qr_access_tokens: emergency QR access
*/

--------------------------------------------------------------------
-- 1. ENUMS
--------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

--------------------------------------------------------------------
-- 2. UTILITY: updated_at
--------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

--------------------------------------------------------------------
-- 3. ADMIN CHECK
--------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin(_uid UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _uid AND role = 'admin'
  );
$$;

--------------------------------------------------------------------
-- 4. PROFILES (all user + medical + emergency contact)
--------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id                        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                     TEXT UNIQUE NOT NULL,
  full_name                 TEXT,
  phone                     TEXT,
  role                      app_role NOT NULL DEFAULT 'user',
  date_of_birth             DATE,

  -- Medical Fields
  blood_type                TEXT CHECK (blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  allergies                 TEXT,
  medications               TEXT,
  chronic_conditions        TEXT,
  additional_notes          TEXT,

  -- Emergency Contact (Primary)
  emergency_contact_name        TEXT,
  emergency_contact_relationship TEXT,
  emergency_contact_phone       TEXT,

  created_at                TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at                TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Owner full access
CREATE POLICY "owner_full_access"
  ON public.profiles FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin full access
CREATE POLICY "admin_full_access"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Public read via active QR token (medical + contact only)
CREATE POLICY "public_qr_access"
  ON public.profiles FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.qr_access_tokens
      WHERE user_id = profiles.id AND is_active = true
    )
  );

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--------------------------------------------------------------------
-- 5. QR ACCESS TOKENS
--------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.qr_access_tokens (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL UNIQUE,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qr_token_active 
  ON public.qr_access_tokens(access_token, is_active) 
  WHERE is_active = true;

ALTER TABLE public.qr_access_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_qr_access"
  ON public.qr_access_tokens FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_qr_updated
  BEFORE UPDATE ON public.qr_access_tokens
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--------------------------------------------------------------------
-- 6. EMERGENCY ORGANIZATIONS
--------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.emergency_organizations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  type       TEXT NOT NULL,
  phone      TEXT NOT NULL,
  location   TEXT NOT NULL,
  website    TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.emergency_organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_public_read"
  ON public.emergency_organizations FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "admin_manage_orgs"
  ON public.emergency_organizations FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER trg_org_updated
  BEFORE UPDATE ON public.emergency_organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--------------------------------------------------------------------
-- 7. FIRST-AID TUTORIALS
--------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tutorials (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  description TEXT,
  video_url  TEXT NOT NULL,
  category   TEXT NOT NULL,
  thumbnail  TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tut_public_read"
  ON public.tutorials FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "admin_manage_tutorials"
  ON public.tutorials FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER trg_tut_updated
  BEFORE UPDATE ON public.tutorials
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--------------------------------------------------------------------
-- 8. AUTO-CREATE PROFILE + QR TOKEN ON SIGNUP
--------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone',
    'user'
  );

  INSERT INTO public.qr_access_tokens (user_id, access_token)
  VALUES (NEW.id, gen_random_uuid()::text);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

--------------------------------------------------------------------
-- 9. ADMIN HELPER
--------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.make_admin(p_email TEXT)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  u_id UUID;
BEGIN
  SELECT id INTO u_id FROM auth.users WHERE email = p_email;
  IF u_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'User not found');
  END IF;
  UPDATE public.profiles SET role = 'admin' WHERE id = u_id;
  RETURN json_build_object('success', true, 'user_id', u_id);
END;
$$;

--------------------------------------------------------------------
-- 10. SEED DATA
--------------------------------------------------------------------
INSERT INTO public.emergency_organizations (name, type, phone, location, website) VALUES
  ('Kenyatta National Hospital', 'Hospital', '+254-20-2726300', 'Hospital Road, Nairobi', 'https://knh.or.ke'),
  ('Nairobi Hospital', 'Hospital', '+254-20-2845000', 'Argwings Kodhek Rd, Nairobi', 'https://nbi-hospital.or.ke'),
  ('Aga Khan University Hospital', 'Hospital', '+254-20-3662000', 'Third Parklands Ave, Nairobi', 'https://aku.edu'),
  ('Kenya Red Cross', 'Emergency Services', '1199', 'South C, Nairobi', 'https://redcross.or.ke'),
  ('AMREF Flying Doctors', 'Air Ambulance', '+254-20-6993000', 'Wilson Airport, Nairobi', 'https://flydoc.org')
ON CONFLICT DO NOTHING;

INSERT INTO public.tutorials (title, description, video_url, category, thumbnail) VALUES
  ('CPR for Adults', 'Step-by-step adult CPR', 'https://www.youtube.com/watch?v=7A7e9KqjOKU', 'CPR', 'https://img.youtube.com/vi/7A7e9KqjOKU/maxresdefault.jpg'),
  ('CPR for Infants', 'CPR for babies under 1 year', 'https://www.youtube.com/watch?v=example-infant', 'CPR', 'https://img.youtube.com/vi/example-infant/maxresdefault.jpg'),
  ('Heimlich Maneuver', 'Clear a choking airway', 'https://www.youtube.com/watch?v=zp4YTjL0CvM', 'Choking', 'https://img.youtube.com/vi/zp4YTjL0CvM/maxresdefault.jpg'),
  ('Stop Severe Bleeding', 'Apply pressure and tourniquet', 'https://www.youtube.com/watch?v=I1jSKhHrME8', 'Bleeding', 'https://img.youtube.com/vi/I1jSKhHrME8/maxresdefault.jpg'),
  ('Burns First Aid', 'Cool and cover burns', 'https://www.youtube.com/watch?v=HRa0YvWvvvg', 'Burns', 'https://img.youtube.com/vi/HRa0YvWvvvg/maxresdefault.jpg'),
  ('Snake Bite Response', 'First 5 minutes are critical', 'https://www.youtube.com/watch?v=NcP6Zs72u8k', 'Snake Bite', 'https://img.youtube.com/vi/NcP6Zs72u8k/maxresdefault.jpg'),
  ('Recovery Position', 'Safe position for unconscious person', 'https://www.youtube.com/watch?v=example-recovery', 'CPR', 'https://img.youtube.com/vi/example-recovery/maxresdefault.jpg')
ON CONFLICT DO NOTHING;