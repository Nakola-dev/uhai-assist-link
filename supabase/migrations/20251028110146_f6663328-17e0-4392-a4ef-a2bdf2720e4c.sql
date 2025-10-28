-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create medical_profiles table for health information
CREATE TABLE public.medical_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  allergies TEXT,
  medications TEXT,
  chronic_conditions TEXT,
  additional_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create emergency_contacts table
CREATE TABLE public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create qr_access_tokens table for secure QR code access
CREATE TABLE public.qr_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  access_token TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_access_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for medical_profiles
CREATE POLICY "Users can view own medical profile"
  ON public.medical_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own medical profile"
  ON public.medical_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medical profile"
  ON public.medical_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view medical profile via QR token"
  ON public.medical_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.qr_access_tokens
      WHERE qr_access_tokens.user_id = medical_profiles.user_id
      AND qr_access_tokens.is_active = true
    )
  );

-- RLS Policies for emergency_contacts
CREATE POLICY "Users can view own emergency contacts"
  ON public.emergency_contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emergency contacts"
  ON public.emergency_contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emergency contacts"
  ON public.emergency_contacts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own emergency contacts"
  ON public.emergency_contacts FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view emergency contacts via QR token"
  ON public.emergency_contacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.qr_access_tokens
      WHERE qr_access_tokens.user_id = emergency_contacts.user_id
      AND qr_access_tokens.is_active = true
    )
  );

-- RLS Policies for qr_access_tokens
CREATE POLICY "Users can view own QR tokens"
  ON public.qr_access_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own QR tokens"
  ON public.qr_access_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own QR tokens"
  ON public.qr_access_tokens FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  
  -- Create empty medical profile
  INSERT INTO public.medical_profiles (user_id)
  VALUES (NEW.id);
  
  -- Generate QR access token
  INSERT INTO public.qr_access_tokens (user_id, access_token)
  VALUES (NEW.id, gen_random_uuid()::text);
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_medical_profiles
  BEFORE UPDATE ON public.medical_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_qr_tokens
  BEFORE UPDATE ON public.qr_access_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();