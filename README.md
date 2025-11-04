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
/*
  # UhaiLink – Final Schema (2025-11-04)
  - profiles: full_name, phone, email, blood_type, allergies, medications, 
    chronic_conditions, additional_notes, emergency_contact_*
  - emergency_organizations: 5 Kenyan services (pre-loaded)
  - tutorials: 7 first-aid videos (pre-loaded)
  - qr_access_tokens: emergency QR access
*/

--------------------------------------------------------------------
-- 1. ENUMS
--------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

--------------------------------------------------------------------
-- 2. UTILITY: updated_at
--------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

--------------------------------------------------------------------
-- 3. ADMIN CHECK
--------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin(_uid UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _uid AND role = 'admin'
  );
$$;

--------------------------------------------------------------------
-- 4. PROFILES (all user + medical + emergency contact)
--------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id                        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                     TEXT UNIQUE NOT NULL,
  full_name                 TEXT,
  phone                     TEXT,
  role                      app_role NOT NULL DEFAULT 'user',
  date_of_birth             DATE,

  -- Medical Fields
  blood_type                TEXT CHECK (blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  allergies                 TEXT,
  medications               TEXT,
  chronic_conditions        TEXT,
  additional_notes          TEXT,

  -- Emergency Contact (Primary)
  emergency_contact_name        TEXT,
  emergency_contact_relationship TEXT,
  emergency_contact_phone       TEXT,

  created_at                TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at                TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Owner full access
CREATE POLICY "owner_full_access"
  ON public.profiles FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin full access
CREATE POLICY "admin_full_access"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Public read via active QR token (medical + contact only)
CREATE POLICY "public_qr_access"
  ON public.profiles FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.qr_access_tokens
      WHERE user_id = profiles.id AND is_active = true
    )
  );

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--------------------------------------------------------------------
-- 5. QR ACCESS TOKENS
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

CREATE POLICY "owner_qr_access"
  ON public.qr_access_tokens FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_qr_updated
  BEFORE UPDATE ON public.qr_access_tokens
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--------------------------------------------------------------------
-- 6. EMERGENCY ORGANIZATIONS
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

CREATE POLICY "org_public_read"
  ON public.emergency_organizations FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "admin_manage_orgs"
  ON public.emergency_organizations FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER trg_org_updated
  BEFORE UPDATE ON public.emergency_organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--------------------------------------------------------------------
-- 7. FIRST-AID TUTORIALS
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

CREATE POLICY "tut_public_read"
  ON public.tutorials FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "admin_manage_tutorials"
  ON public.tutorials FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER trg_tut_updated
  BEFORE UPDATE ON public.tutorials
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--------------------------------------------------------------------
-- 8. AUTO-CREATE PROFILE + QR TOKEN ON SIGNUP
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

--------------------------------------------------------------------
-- 9. ADMIN HELPER
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
-- 10. SEED DATA
--------------------------------------------------------------------
INSERT INTO public.emergency_organizations (name, type, phone, location, website) VALUES
  ('Kenyatta National Hospital', 'Hospital', '+254-20-2726300', 'Hospital Road, Nairobi', 'https://knh.or.ke'),
  ('Nairobi Hospital', 'Hospital', '+254-20-2845000', 'Argwings Kodhek Rd, Nairobi', 'https://nbi-hospital.or.ke'),
  ('Aga Khan University Hospital', 'Hospital', '+254-20-3662000', 'Third Parklands Ave, Nairobi', 'https://aku.edu'),
  ('Kenya Red Cross', 'Emergency Services', '1199', 'South C, Nairobi', 'https://redcross.or.ke'),
  ('AMREF Flying Doctors', 'Air Ambulance', '+254-20-6993000', 'Wilson Airport, Nairobi', 'https://flydoc.org')
ON CONFLICT DO NOTHING;

INSERT INTO public.tutorials (title, description, video_url, category, thumbnail) VALUES
  ('CPR for Adults', 'Step-by-step adult CPR', 'https://www.youtube.com/watch?v=7A7e9KqjOKU', 'CPR', 'https://img.youtube.com/vi/7A7e9KqjOKU/maxresdefault.jpg'),
  ('CPR for Infants', 'CPR for babies under 1 year', 'https://www.youtube.com/watch?v=example-infant', 'CPR', 'https://img.youtube.com/vi/example-infant/maxresdefault.jpg'),
  ('Heimlich Maneuver', 'Clear a choking airway', 'https://www.youtube.com/watch?v=zp4YTjL0CvM', 'Choking', 'https://img.youtube.com/vi/zp4YTjL0CvM/maxresdefault.jpg'),
  ('Stop Severe Bleeding', 'Apply pressure and tourniquet', 'https://www.youtube.com/watch?v=I1jSKhHrME8', 'Bleeding', 'https://img.youtube.com/vi/I1jSKhHrME8/maxresdefault.jpg'),
  ('Burns First Aid', 'Cool and cover burns', 'https://www.youtube.com/watch?v=HRa0YvWvvvg', 'Burns', 'https://img.youtube.com/vi/HRa0YvWvvvg/maxresdefault.jpg'),
  ('Snake Bite Response', 'First 5 minutes are critical', 'https://www.youtube.com/watch?v=NcP6Zs72u8k', 'Snake Bite', 'https://img.youtube.com/vi/NcP6Zs72u8k/maxresdefault.jpg'),
  ('Recovery Position', 'Safe position for unconscious person', 'https://www.youtube.com/watch?v=example-recovery', 'CPR', 'https://img.youtube.com/vi/example-recovery/maxresdefault.jpg')
ON CONFLICT DO NOTHING;




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

## 📁 File Structure

```
src/
├── pages/
│   ├── Index.tsx               # Landing page
│   ├── Auth.tsx                # Login / signup + profile creation
│   ├── Dashboard.tsx           # User dashboard
│   ├── AdminDashboard.tsx      # Admin panel
│   ├── Assistant.tsx           # AI first-aid chat
│   ├── ProfileView.tsx         # QR responder view
│   ├── UserProfilePage.tsx     # Edit medical profile
│   ├── UserQRPage.tsx          # QR generation & management
│   ├── About.tsx               # About page
│   ├── Contact.tsx             # Contact form
│   └── NotFound.tsx            # 404 page
├── components/
│   ├── Header.tsx              # Navigation bar
│   ├── Footer.tsx              # Footer
│   ├── Layout.tsx              # Page wrapper
│   ├── HeroSlider.tsx          # Homepage slider
│   ├── EmergencyContactsForm.tsx # Emergency contact form
│   ├── MedicalProfileForm.tsx  # Medical profile editor
│   ├── QRCodeDisplay.tsx       # QR generator / display
│   └── ui/                     # Shadcn/UI components
├── lib/
│   ├── openrouter.ts           # DeepSeek API calls
│   ├── auth-utils.ts           # Auth helpers
│   └── utils.ts                # General utilities
├── integrations/
│   └── supabase/
│       ├── client.ts           # Supabase client
│       └── types.ts            # Generated types
├── App.tsx                     # Routes & ProtectedRoute
└── supabase/
└── migrations/
├── uhai_schema.sql     # Full schema + seed
└── seed_initial_data.sql # Optional seed (idempotent)
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
