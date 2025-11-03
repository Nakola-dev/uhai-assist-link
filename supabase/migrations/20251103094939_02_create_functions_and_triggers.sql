/*
  # UhaiLink Schema - Part 2: Functions and Triggers
  
  Creates utility functions and triggers for:
  - Automatic timestamp updates
  - Role checking for RLS policies
  - Auto-profile creation on user signup
  - Role synchronization between tables
*/

-- ========================================
-- 1. UTILITY FUNCTIONS
-- ========================================

-- Updated_at timestamp function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Role check function (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- ========================================
-- 2. AUTO-CREATE PROFILE ON SIGNUP
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone',
    'user'
  );

  -- Insert user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Insert empty medical profile
  INSERT INTO public.medical_profiles (user_id)
  VALUES (NEW.id);

  -- Insert QR token
  INSERT INTO public.qr_access_tokens (user_id, access_token)
  VALUES (NEW.id, gen_random_uuid()::text);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_new_user ON auth.users;
CREATE TRIGGER trg_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- 3. SYNC PROFILE ROLE TO USER_ROLES
-- ========================================
CREATE OR REPLACE FUNCTION public.sync_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    DELETE FROM public.user_roles WHERE user_id = NEW.id;
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, NEW.role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_role ON public.profiles;
CREATE TRIGGER trg_sync_role
  AFTER UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_role();

-- ========================================
-- 4. UPDATED_AT TRIGGERS
-- ========================================
DROP TRIGGER IF EXISTS trg_updated_at_profiles ON public.profiles;
CREATE TRIGGER trg_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_updated_at_medical ON public.medical_profiles;
CREATE TRIGGER trg_updated_at_medical
  BEFORE UPDATE ON public.medical_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_updated_at_qr ON public.qr_access_tokens;
CREATE TRIGGER trg_updated_at_qr
  BEFORE UPDATE ON public.qr_access_tokens
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_updated_at_orgs ON public.emergency_organizations;
CREATE TRIGGER trg_updated_at_orgs
  BEFORE UPDATE ON public.emergency_organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_updated_at_tutorials ON public.tutorials;
CREATE TRIGGER trg_updated_at_tutorials
  BEFORE UPDATE ON public.tutorials
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();