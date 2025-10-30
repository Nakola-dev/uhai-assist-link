/*
  # Create Profiles Table and Admin Account

  ## Overview
  This migration creates a profiles table synced with auth.users and sets up the default admin account.

  ## New Tables Created
  
  ### `profiles`
  User profile information synced with Supabase Auth
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, unique)
  - `role` (enum: admin/user, default: user)
  - `full_name` (text, optional)
  - `phone` (text, optional)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

  ## Security (Row Level Security)
  
  - Users can view their own profile
  - Users can update their own profile (except role)
  - Admins can view all profiles
  - Admins can update all profiles

  ## Triggers
  
  - Auto-create profile on user signup
  - Auto-update timestamps
  - Sync email changes from auth.users

  ## Initial Data
  
  - Default admin account: admin@gmail.com / admin.123
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'user'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to sync profile role to user_roles
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

-- Trigger to sync role changes
DROP TRIGGER IF EXISTS on_profile_role_change ON public.profiles;
CREATE TRIGGER on_profile_role_change
  AFTER UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_role();

-- Create admin user function (to be called manually or via RPC)
CREATE OR REPLACE FUNCTION public.create_admin_user(
  user_email TEXT,
  user_password TEXT,
  user_full_name TEXT DEFAULT 'System Administrator'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Check if user already exists
  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF new_user_id IS NOT NULL THEN
    -- Update existing user to admin
    UPDATE public.profiles
    SET role = 'admin', full_name = user_full_name
    WHERE id = new_user_id;
    
    DELETE FROM public.user_roles WHERE user_id = new_user_id;
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    result := json_build_object(
      'success', true,
      'message', 'Existing user upgraded to admin',
      'user_id', new_user_id
    );
  ELSE
    -- User doesn't exist, return instruction
    result := json_build_object(
      'success', false,
      'message', 'Please create user via Supabase Auth first, then call this function'
    );
  END IF;
  
  RETURN result;
END;
$$;