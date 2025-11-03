/*
  # Fresh UhaiLink Database Schema

  1. New Tables
    - `profiles` - User profiles linked to auth.users with full medical data
    - `emergency_organizations` - Kenyan hospitals and emergency services
    - `tutorials` - First aid video tutorials

  2. Security
    - RLS enabled on all tables
    - Users can only read/write their own profile
    - Emergency organizations and tutorials are publicly readable
    - Auto-create profile on signup via trigger

  3. Trigger
    - `handle_new_user()` automatically creates profile row on auth signup
    - Inserts full_name, phone from metadata, role defaults to 'user'
*/

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  email TEXT UNIQUE NOT NULL,
  blood_type text,
  allergies text[],
  chronic_conditions text[],
  medications text[],
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relationship text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);


-- QR Access Tokens Table
CREATE TABLE IF NOT EXISTS public.qr_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_token_active ON public.qr_access_tokens(access_token, is_active) WHERE is_active = true;


CREATE TABLE IF NOT EXISTS public.emergency_organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  phone text NOT NULL,
  location text NOT NULL,
  website text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tutorials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  category text NOT NULL,
  thumbnail text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_profile" ON public.profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "organizations_public_read" ON public.emergency_organizations
  FOR SELECT TO public USING (true);

CREATE POLICY "tutorials_public_read" ON public.tutorials
  FOR SELECT TO public USING (true);

CREATE POLICY "admins_manage_organizations" ON public.emergency_organizations
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "admins_manage_tutorials" ON public.tutorials
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
