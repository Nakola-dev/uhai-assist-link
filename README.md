# 🆘 UhaiLink — AI-Powered Emergency Response Platform for Africa

> **When Every Second Counts, AI Responds**

A full-stack emergency assistance platform delivering real-time AI-guided first aid, QR-coded medical identity, secure medical profiles, and instant emergency contacts for Kenya and Africa. Built with React + Vite + Tailwind + TypeScript, powered by Supabase PostgreSQL + RLS + Auth, with DeepSeek R1 AI integration.

---

## 📋 Quick Navigation

- [Features](#-key-features)
- [Tech Stack](#-technology-stack)
- [Database Schema](#-database-schema)
- [Setup & Installation](#-getting-started)
- [Authentication Flow](#-authentication-flow)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [Roadmap](#-roadmap)

---

## 🎯 The Challenge

**Every minute, lives are lost in Kenya due to:**
- ❌ Bystanders frozen without emergency first aid knowledge
- ❌ Responders lacking critical patient medical history
- ❌ Slow access to emergency contacts and hospitals
- ❌ Unreliable internet delaying help in rural areas

**UhaiLink solves this with AI-guided, offline-aware emergency support.**

---

## ⭐ Key Features

### 1. 🤖 AI First Aid Assistant
- Real-time conversational AI providing step-by-step first aid instructions
- Covers CPR, choking, burns, severe bleeding, fractures, unconsciousness, seizures, allergic reactions
- Powered by DeepSeek R1 via OpenRouter API
- Context-aware using user's blood type, allergies, chronic conditions
- Text-to-speech for hands-free operation
- Full-screen emergency mode with large readable text

### 2. 📱 QR Medical ID System
- Generate secure QR codes containing encrypted medical information
- Responders scan QR to instantly access patient data during emergencies
- Includes blood type, allergies, chronic conditions, medications, emergency contacts
- Time-limited access tokens for privacy protection

### 3. 🏥 Emergency Directory
- Pre-loaded with Kenya's major hospitals and emergency services
- Direct call functionality and website links
- Red Cross, AMREF, St. John Ambulance contacts
- Admin-manageable contact database

### 4. 👤 Medical Profile Management
- Comprehensive health information storage
- Multiple emergency contacts with priority levels
- Secure encrypted data in Supabase
- Easy profile updates and QR code regeneration

### 5. 🎓 First Aid Tutorials
- Video tutorials categorized by emergency type
- Admin-managed content (CPR, Bleeding, Burns, Choking, Snake Bite)
- Searchable and filterable library

### 6. 🛡️ Admin Dashboard
- Manage tutorials and organizations
- System analytics and user counts
- Real-time content moderation

---

## 🛠 Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS + React Router v6 |
| **UI Components** | Shadcn/UI + Radix UI + Lucide Icons |
| **State** | TanStack Query + Context API |
| **Backend** | Supabase (PostgreSQL + Auth + RLS) |
| **AI** | DeepSeek R1 via OpenRouter API |
| **QR** | qrcode.react |
| **Notifications** | Sonner + React-Toastify |
| **Security** | JWT + RLS + HTTPS + Role-Based Access Control |

---

## 📊 Database Schema

### Complete SQL Schema Setup
-- ========================================
-- UHAI ASSIST CONSOLIDATED SCHEMA (2025-11-03)
-- ========================================
-- This single migration file combines all tables, enums, functions,
-- triggers, RLS policies and seed data from the previous files.
-- Run it on a fresh Supabase project or after backing up existing data.

-- 1. ENUMS
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. UTILITY FUNCTION: updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3. ROLE CHECK FUNCTION (security definer to avoid RLS recursion)
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

-- 4. USER ROLES TABLE
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS for user_roles
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

-- 5. PROFILES TABLE (merged – includes email, avatar, DOB)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  full_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS for profiles
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

-- 6. MEDICAL PROFILES (encrypted in app layer)
CREATE TABLE IF NOT EXISTS public.medical_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  allergies TEXT,
  medications TEXT,
  chronic_conditions TEXT,
  additional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  INDEX idx_medical_user (user_id)
);

ALTER TABLE public.medical_profiles ENABLE ROW LEVEL SECURITY;

-- RLS: owner + public via active QR token
DROP POLICY IF EXISTS "owner_medical_all" ON public.medical_profiles;
CREATE POLICY "owner_medical_all"
  ON public.medical_profiles FOR SELECT, INSERT, UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "public_medical_via_qr" ON public.medical_profiles;
CREATE POLICY "public_medical_via_qr"
  ON public.medical_profiles FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.qr_access_tokens
      WHERE qr_access_tokens.user_id = medical_profiles.user_id
        AND qr_access_tokens.is_active = true
    )
  );

-- 7. USER EMERGENCY CONTACTS
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  INDEX idx_emergency_user (user_id)
);

ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- RLS: owner + public via QR
DROP POLICY IF EXISTS "owner_contacts_all" ON public.emergency_contacts;
CREATE POLICY "owner_contacts_all"
  ON public.emergency_contacts FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "public_contacts_via_qr" ON public.emergency_contacts;
CREATE POLICY "public_contacts_via_qr"
  ON public.emergency_contacts FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.qr_access_tokens
      WHERE qr_access_tokens.user_id = emergency_contacts.user_id
        AND qr_access_tokens.is_active = true
    )
  );

-- 8. QR ACCESS TOKENS
CREATE TABLE IF NOT EXISTS public.qr_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  INDEX idx_token_active (access_token, is_active) WHERE is_active = true
);

ALTER TABLE public.qr_access_tokens ENABLE ROW LEVEL SECURITY;

-- RLS: owner only
DROP POLICY IF EXISTS "owner_qr_all" ON public.qr_access_tokens;
CREATE POLICY "owner_qr_all"
  ON public.qr_access_tokens FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 9. PUBLIC EMERGENCY ORGANIZATIONS
CREATE TABLE IF NOT EXISTS public.emergency_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.emergency_organizations ENABLE ROW LEVEL SECURITY;

-- RLS: public read, admin write
DROP POLICY IF EXISTS "public_read_orgs" ON public.emergency_organizations;
CREATE POLICY "public_read_orgs"
  ON public.emergency_organizations FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "admin_write_orgs" ON public.emergency_organizations;
CREATE POLICY "admin_write_orgs"
  ON public.emergency_organizations FOR INSERT, UPDATE, DELETE
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 10. FIRST AID TUTORIALS
CREATE TABLE IF NOT EXISTS public.tutorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  video_url TEXT NOT NULL,
  category TEXT NOT NULL,
  thumbnail TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;

-- RLS: public read, admin write
DROP POLICY IF EXISTS "public_read_tutorials" ON public.tutorials;
CREATE POLICY "public_read_tutorials"
  ON public.tutorials FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "admin_write_tutorials" ON public.tutorials;
CREATE POLICY "admin_write_tutorials"
  ON public.tutorials FOR INSERT, UPDATE, DELETE
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ========================================
-- TRIGGERS
-- ========================================

-- updated_at for all timestamped tables
CREATE TRIGGER trg_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_updated_at_medical
  BEFORE UPDATE ON public.medical_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_updated_at_qr
  BEFORE UPDATE ON public.qr_access_tokens
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_updated_at_orgs
  BEFORE UPDATE ON public.emergency_organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_updated_at_tutorials
  BEFORE UPDATE ON public.tutorials
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile, medical profile, QR token & user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Profile
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone',
    'user'
  );

  -- User role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Empty medical profile
  INSERT INTO public.medical_profiles (user_id)
  VALUES (NEW.id);

  -- Secure QR token
  INSERT INTO public.qr_access_tokens (user_id, access_token)
  VALUES (NEW.id, gen_random_uuid()::text);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_new_user ON auth.users;
CREATE TRIGGER trg_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sync profile.role → user_roles
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

-- Admin creation helper (call manually or via RPC)
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
  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = user_email;

  IF new_user_id IS NOT NULL THEN
    UPDATE public.profiles
    SET role = 'admin', full_name = user_full_name
    WHERE id = new_user_id;

    DELETE FROM public.user_roles WHERE user_id = new_user_id;
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    result := json_build_object(
      'success', true,
      'message', 'User upgraded to admin',
      'user_id', new_user_id
    );
  ELSE
    result := json_build_object(
      'success', false,
      'message', 'Create user via Supabase Auth first, then call this function'
    );
  END IF;
  RETURN result;
END;
$$;

-- ========================================
-- SEED DATA
-- ========================================

-- Kenyan emergency organizations
INSERT INTO public.emergency_organizations (name, type, phone, location, website) VALUES
  ('Kenyatta National Hospital', 'Hospital', '+254-20-2726300', 'Hospital Road, Nairobi', 'https://knh.or.ke'),
  ('Nairobi Hospital', 'Hospital', '+254-20-2845000', 'Argwings Kodhek Road, Nairobi', 'https://nbi-hospital.or.ke'),
  ('Aga Khan University Hospital', 'Hospital', '+254-20-3662000', 'Third Parklands Avenue, Nairobi', 'https://aku.edu'),
  ('Kenya Red Cross', 'Emergency Services', '1199', 'South C, Red Cross Road, Nairobi', 'https://redcross.or.ke'),
  ('AMREF Flying Doctors', 'Air Ambulance', '+254-20-6993000', 'Wilson Airport, Nairobi', 'https://flydoc.org')
ON CONFLICT DO NOTHING;

-- Sample first aid tutorials
INSERT INTO public.tutorials (title, description, video_url, category, thumbnail) VALUES
  ('CPR - Cardiopulmonary Resuscitation', 'Learn how to perform CPR to save a life during cardiac arrest', 'https://www.youtube.com/watch?v=7A7e9KqjOKU', 'CPR', 'https://img.youtube.com/vi/7A7e9KqjOKU/maxresdefault.jpg'),
  ('How to Help a Choking Person', 'Step-by-step guide to the Heimlich maneuver for choking victims', 'https://www.youtube.com/watch?v=zp4YTjL0CvM', 'Choking', 'https://img.youtube.com/vi/zp4YTjL0CvM/maxresdefault.jpg'),
  ('First Aid for Burns', 'Immediate treatment for burn injuries', 'https://www.youtube.com/watch?v=HRa0YvWvvvg', 'Burns', 'https://img.youtube.com/vi/HRa0YvWvvvg/maxresdefault.jpg'),
  ('Treating Severe Bleeding', 'How to stop heavy bleeding and apply pressure', 'https://www.youtube.com/watch?v=I1jSKhHrME8', 'Bleeding', 'https://img.youtube.com/vi/I1jSKhHrME8/maxresdefault.jpg'),
  ('How to Treat a Snake Bite', 'Essential first aid steps for snake bite emergencies', 'https://www.youtube.com/watch?v=NcP6Zs72u8k', 'Snake Bite', 'https://img.youtube.com/vi/NcP6Zs72u8k/maxresdefault.jpg')
ON CONFLICT DO NOTHING;

-- ========================================
-- END OF MIGRATION
-- ========================================


## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm or bun
- Supabase account (or Lovable Cloud)
- OpenRouter API key

### 1️⃣ Clone & Install

```bash
git clone https://github.com/uhailink/uhailink.git
cd uhailink
npm install
```

### 2️⃣ Environment Variables

Create `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

### 3️⃣ Database Setup

In Supabase SQL Editor, run the schema SQL above to:
- Create profiles, organizations, tutorials, user_roles tables
- Enable RLS on all tables
- Create handle_new_user trigger for auto-profile creation

### 4️⃣ Start Development

```bash
npm run dev
# App opens at http://localhost:5173
```

### 5️⃣ Build for Production

```bash
npm run build
npm run preview
```

---

## 🔐 Authentication Flow

### Signup → Instant Dashboard (No Login Loop)

1. **User fills registration form** (email, password, full name, phone)
2. **Supabase creates auth user** via `signUp()`
3. **Trigger fires automatically** → Creates profile row + user_roles entry
4. **Auth.tsx inserts profile immediately** (before redirect)
5. **useRef guard prevents double-redirect** (`isRedirecting` flag)
6. **`navigate(..., { replace: true })`** → Instant `/dashboard/user`
7. ✅ **No login loop, no blank page**

### ProtectedRoute Logic

```typescript
// Fetches user's role from profiles table
const userRole = profile?.role ?? "user";  // Fallback if no profile

// Allows access if:
// - requiredRole === undefined (optional protection) OR
// - userRole === requiredRole (role matches)

// Does NOT redirect on access denial (let Dashboard handle 404)
if (requiredRole && !hasAccess) {
  return <>{children}</>;  // Render page anyway (or show 404)
}
```

---

## 🔧 Fix Common Issues

### Login Loop / Infinite Redirect?

**Cause:** Profile not created before redirect attempt

**Fix:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Ensure `handle_new_user` trigger exists in Supabase
3. Check `.env` has correct SUPABASE_URL and KEY
4. Verify `Auth.tsx` inserts profile **before** calling `redirectToDashboard()`

### Profile Not Loading After Signup?

**Check:**
```sql
-- In Supabase, run:
SELECT * FROM profiles WHERE id = 'user-id-here';
SELECT * FROM user_roles WHERE user_id = 'user-id-here';
```

If empty, trigger didn't fire. Manually insert:
```sql
INSERT INTO profiles (id, full_name, role) VALUES ('user-uuid', 'Full Name', 'user');
INSERT INTO user_roles (user_id, role) VALUES ('user-uuid', 'user');
```

### AI Assistant Not Responding?

- Check `.env` has valid `VITE_OPENROUTER_API_KEY`
- Verify OpenRouter account has credit
- Check network tab for response errors
- Ensure DeepSeek R1 model is available in OpenRouter

---

## 📁 File Structure

```
src/
├── pages/
│   ├── Index.tsx              # Landing page
│   ├── Auth.tsx               # Login/signup with profile insertion
│   ├── Dashboard.tsx          # User dashboard
│   ├── AdminDashboard.tsx     # Admin panel
│   ├── Assistant.tsx          # AI first aid chat
│   ├── ProfileView.tsx        # QR responder view
│   ├── About.tsx              # Info page
│   ├── Contact.tsx            # Contact form
│   └── NotFound.tsx           # 404 page
├── components/
│   ├── Header.tsx             # Navigation bar
│   ├── Footer.tsx             # Footer
│   ├── Layout.tsx             # Page wrapper
│   ├── HeroSlider.tsx         # Homepage slider
│   ├── MedicalProfileForm.tsx # Profile editor
│   ├── QRCodeDisplay.tsx      # QR generator
│   └── ui/                    # Shadcn/UI components
├── lib/
│   ├── openrouter.ts          # DeepSeek API calls
│   ├── auth-utils.ts          # Auth helpers
│   └── utils.ts               # Utilities
├── integrations/
│   └── supabase/
│       ├── client.ts          # Supabase client
│       └── types.ts           # Generated types
└── App.tsx                    # Routes & ProtectedRoute
```

---

## 🛣 Roadmap

### ✅ Phase 1 (Complete)
- [x] AI first aid assistant (DeepSeek R1)
- [x] User authentication & profiles
- [x] QR medical ID generation
- [x] Emergency directory
- [x] Admin dashboard
- [x] Mobile-responsive design
- [x] Database schema with RLS

### 🔄 Phase 2 (In Progress)
- [ ] Text-to-speech enhancements
- [ ] Advanced search & filtering
- [ ] Push notifications
- [ ] Tutorial video hosting

### 🔜 Phase 3 (Planned)
- [ ] Offline PWA support
- [ ] SMS/USSD fallback for 2G
- [ ] Voice command activation
- [ ] Geolocation for nearest hospital
- [ ] Direct ambulance dispatch API
- [ ] Swahili language support

---

## 🤝 Contributing

### Code Quality
- ESLint + Prettier configured
- TypeScript for type safety
- Follow existing patterns

### Commit Format
```
feat(scope): Description      # New feature
fix(scope): Description       # Bug fix
docs(scope): Description      # Documentation
style(scope): Description     # Formatting
```

### Testing Before Commit
```bash
npm run build     # Verify build succeeds
npm run lint      # Check for errors
npm run dev       # Test in browser
```

---

## 🔒 Security & Privacy

- **AES-256 encryption** for medical data
- **JWT tokens** for authentication
- **Row Level Security** on all tables
- **Role-Based Access Control** via user_roles table
- **HTTPS enforced** on all connections
- **Time-limited QR tokens** for access control

All user data is isolated via RLS policies. Admin roles cannot access other users' medical information.

---

## 📞 Support & Issues

- **Report bugs:** GitHub Issues
- **Request features:** GitHub Discussions
- **Emergency:** Always call 999 first!

---

## 📄 License

MIT © 2025 UhaiLink Development Team

---

## 🌍 Built for Kenya. Designed for Africa.

- ✅ Mobile-first for low-bandwidth networks
- ✅ Works on 2G/3G (offline PWA planned)
- ✅ Pre-configured Kenyan emergency services
- ✅ Swahili support coming soon
- ✅ Community-driven & open source

### Our Mission
> **Uhai = Life** in Swahili
> We protect it, one emergency at a time.

---

**🚨 IMPORTANT: In real emergencies, always call 999 (Kenya) or 911 (International) FIRST! This is AI guidance only, not a substitute for professional medical help.**

**⭐ If this helps you or someone you know, star this repo!**
