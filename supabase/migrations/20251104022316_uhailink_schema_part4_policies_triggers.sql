/*
  # UhaiLink Schema - Part 4: RLS Policies and Triggers
*/

--------------------------------------------------------------------
-- PROFILES RLS POLICIES
--------------------------------------------------------------------
CREATE POLICY "owner_full_access" ON public.profiles FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "admin_full_access" ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "public_qr_access" ON public.profiles FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.qr_access_tokens
      WHERE user_id = profiles.id AND is_active = true
    )
  );

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--------------------------------------------------------------------
-- QR ACCESS TOKENS RLS POLICIES
--------------------------------------------------------------------
CREATE POLICY "owner_qr_access" ON public.qr_access_tokens FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_qr_updated BEFORE UPDATE ON public.qr_access_tokens
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--------------------------------------------------------------------
-- EMERGENCY ORGANIZATIONS RLS POLICIES
--------------------------------------------------------------------
CREATE POLICY "org_public_read" ON public.emergency_organizations FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "admin_manage_orgs" ON public.emergency_organizations FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER trg_org_updated BEFORE UPDATE ON public.emergency_organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--------------------------------------------------------------------
-- TUTORIALS RLS POLICIES
--------------------------------------------------------------------
CREATE POLICY "tut_public_read" ON public.tutorials FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "admin_manage_tutorials" ON public.tutorials FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER trg_tut_updated BEFORE UPDATE ON public.tutorials
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
