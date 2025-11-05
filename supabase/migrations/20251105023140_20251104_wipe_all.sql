/*
  Wipe all tables and objects from public schema
*/

-- Drop all triggers first
DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles CASCADE;
DROP TRIGGER IF EXISTS trg_qr_updated ON public.qr_access_tokens CASCADE;
DROP TRIGGER IF EXISTS trg_org_updated ON public.emergency_organizations CASCADE;
DROP TRIGGER IF EXISTS trg_tut_updated ON public.tutorials CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

-- Drop all tables
DROP TABLE IF EXISTS public.tutorials CASCADE;
DROP TABLE IF EXISTS public.emergency_organizations CASCADE;
DROP TABLE IF EXISTS public.qr_access_tokens CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.make_admin(TEXT) CASCADE;

-- Drop enum
DROP TYPE IF EXISTS public.app_role CASCADE;