/*
  # UhaiLink Schema - Part 3: Helper Functions
*/

--------------------------------------------------------------------
-- ADMIN CHECK FUNCTION
--------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin(_uid UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _uid AND role = 'admin'
  );
$$;

--------------------------------------------------------------------
-- MAKE ADMIN FUNCTION
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
-- AUTO-CREATE PROFILE + QR TOKEN ON SIGNUP
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
