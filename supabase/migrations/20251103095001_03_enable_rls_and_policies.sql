/*
  # UhaiLink Schema - Part 3: Row Level Security
  
  Enables RLS on all tables and creates comprehensive security policies:
  - Users can only access their own data
  - Admins have elevated permissions
  - QR tokens grant temporary public access to medical data
  - Public read access for tutorials and organizations
*/

-- ========================================
-- 1. ENABLE RLS ON ALL TABLES
-- ========================================
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 2. USER_ROLES POLICIES
-- ========================================
DROP POLICY IF EXISTS "users_view_own_roles" ON public.user_roles;
CREATE POLICY "users_view_own_roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admins_view_all_roles" ON public.user_roles;
CREATE POLICY "admins_view_all_roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins_insert_roles" ON public.user_roles;
CREATE POLICY "admins_insert_roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins_delete_roles" ON public.user_roles;
CREATE POLICY "admins_delete_roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ========================================
-- 3. PROFILES POLICIES
-- ========================================
DROP POLICY IF EXISTS "users_view_own_profile" ON public.profiles;
CREATE POLICY "users_view_own_profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "admins_view_all_profiles" ON public.profiles;
CREATE POLICY "admins_view_all_profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
CREATE POLICY "users_update_own_profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "admins_update_all_profiles" ON public.profiles;
CREATE POLICY "admins_update_all_profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ========================================
-- 4. MEDICAL_PROFILES POLICIES
-- ========================================
DROP POLICY IF EXISTS "owner_medical_all" ON public.medical_profiles;
CREATE POLICY "owner_medical_all"
  ON public.medical_profiles FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "public_medical_via_qr" ON public.medical_profiles;
CREATE POLICY "public_medical_via_qr"
  ON public.medical_profiles FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.qr_access_tokens
      WHERE qr_access_tokens.user_id = medical_profiles.user_id
        AND qr_access_tokens.is_active = true
    )
  );

-- ========================================
-- 5. EMERGENCY_CONTACTS POLICIES
-- ========================================
DROP POLICY IF EXISTS "owner_contacts_all" ON public.emergency_contacts;
CREATE POLICY "owner_contacts_all"
  ON public.emergency_contacts FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "public_contacts_via_qr" ON public.emergency_contacts;
CREATE POLICY "public_contacts_via_qr"
  ON public.emergency_contacts FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.qr_access_tokens
      WHERE qr_access_tokens.user_id = emergency_contacts.user_id
        AND qr_access_tokens.is_active = true
    )
  );

-- ========================================
-- 6. QR_ACCESS_TOKENS POLICIES
-- ========================================
DROP POLICY IF EXISTS "owner_qr_all" ON public.qr_access_tokens;
CREATE POLICY "owner_qr_all"
  ON public.qr_access_tokens FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ========================================
-- 7. EMERGENCY_ORGANIZATIONS POLICIES
-- ========================================
DROP POLICY IF EXISTS "public_read_orgs" ON public.emergency_organizations;
CREATE POLICY "public_read_orgs"
  ON public.emergency_organizations FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "admin_insert_orgs" ON public.emergency_organizations;
CREATE POLICY "admin_insert_orgs"
  ON public.emergency_organizations FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admin_update_orgs" ON public.emergency_organizations;
CREATE POLICY "admin_update_orgs"
  ON public.emergency_organizations FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admin_delete_orgs" ON public.emergency_organizations;
CREATE POLICY "admin_delete_orgs"
  ON public.emergency_organizations FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ========================================
-- 8. TUTORIALS POLICIES
-- ========================================
DROP POLICY IF EXISTS "public_read_tutorials" ON public.tutorials;
CREATE POLICY "public_read_tutorials"
  ON public.tutorials FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "admin_insert_tutorials" ON public.tutorials;
CREATE POLICY "admin_insert_tutorials"
  ON public.tutorials FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admin_update_tutorials" ON public.tutorials;
CREATE POLICY "admin_update_tutorials"
  ON public.tutorials FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admin_delete_tutorials" ON public.tutorials;
CREATE POLICY "admin_delete_tutorials"
  ON public.tutorials FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));