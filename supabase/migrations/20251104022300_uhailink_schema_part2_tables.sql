/*
  # UhaiLink Schema - Part 2: Tables and Basic RLS
*/

--------------------------------------------------------------------
-- PROFILES
--------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id                        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                     TEXT UNIQUE NOT NULL,
  full_name                 TEXT,
  phone                     TEXT,
  role                      public.app_role NOT NULL DEFAULT 'user',
  date_of_birth             DATE,
  blood_type                TEXT CHECK (blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  allergies                 TEXT,
  medications               TEXT,
  chronic_conditions        TEXT,
  additional_notes          TEXT,
  emergency_contact_name    TEXT,
  emergency_contact_relationship TEXT,
  emergency_contact_phone   TEXT,
  created_at                TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at                TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------
-- QR ACCESS TOKENS
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

--------------------------------------------------------------------
-- EMERGENCY ORGANIZATIONS
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

--------------------------------------------------------------------
-- TUTORIALS
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
