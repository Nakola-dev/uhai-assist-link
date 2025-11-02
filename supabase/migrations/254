-- ========================================
-- UHAILINK DATABASE SCHEMA (Production)
-- ========================================

-- 1. PROFILES (User Info)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  date_of_birth DATE,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MEDICAL PROFILES
CREATE TABLE IF NOT EXISTS public.medical_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  allergies TEXT,
  medications TEXT,
  chronic_conditions TEXT,
  additional_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EMERGENCY CONTACTS
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  INDEX idx_emergency_user (user_id)
);

-- 4. QR ACCESS TOKENS
CREATE TABLE IF NOT EXISTS public.qr_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  INDEX idx_token_active (access_token, is_active)
);

-- ========================================
-- ENABLE RLS
-- ========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_access_tokens ENABLE ROW LEVEL SECURITY;

-- ========================================
-- RLS POLICIES
-- ========================================

-- PROFILES: Owner only
CREATE POLICY "owner_profile_select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "owner_profile_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "owner_profile_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- MEDICAL PROFILES: Owner + Public via active QR
CREATE POLICY "owner_medical_select" ON public.medical_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner_medical_upsert" ON public.medical_profiles FOR INSERT, UPDATE WITH CHECK (auth.uid() = user_id);

-- Public access via QR token
CREATE POLICY "public_medical_via_qr" ON public.medical_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.qr_access_tokens
      WHERE qr_access_tokens.user_id = medical_profiles.user_id
        AND qr_access_tokens.is_active = true
    )
  );

-- EMERGENCY CONTACTS: Owner + Public via QR
CREATE POLICY "owner_contacts_all" ON public.emergency_contacts
  FOR SELECT, INSERT, UPDATE, DELETE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "public_contacts_via_qr" ON public.emergency_contacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.qr_access_tokens
      WHERE qr_access_tokens.user_id = emergency_contacts.user_id
        AND qr_access_tokens.is_active = true
    )
  );

-- QR TOKENS: Owner only
CREATE POLICY "owner_qr_select" ON public.qr_access_tokens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner_qr_insert" ON public.qr_access_tokens FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_qr_update" ON public.qr_access_tokens FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- AUTO-CREATE ON SIGNUP
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.raw_user_meta_data->>'phone',
    'user'
  );

  -- Create empty medical profile
  INSERT INTO public.medical_profiles (user_id)
  VALUES (NEW.id);

  -- Generate secure QR token
  INSERT INTO public.qr_access_tokens (user_id, access_token)
  VALUES (NEW.id, gen_random_uuid()::text);

  RETURN NEW;
END;
$$;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- AUTO UPDATE updated_at
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_medical
  BEFORE UPDATE ON public.medical_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_qr
  BEFORE UPDATE ON public.qr_access_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ========================================
-- INDEXES (Performance)
-- ========================================
CREATE INDEX IF NOT EXISTS idx_medical_user ON public.medical_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_token ON public.qr_access_tokens(access_token) WHERE is_active = true;