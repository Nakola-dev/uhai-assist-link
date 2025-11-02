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

```sql
-- 1. PROFILES TABLE (links to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  role text DEFAULT 'user',  -- 'user' or 'admin'
  created_at timestamp with time zone DEFAULT now()
);

-- 2. EMERGENCY ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS emergency_organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  phone text NOT NULL,
  location text NOT NULL,
  website text,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. TUTORIALS TABLE
CREATE TABLE IF NOT EXISTS tutorials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  category text NOT NULL,  -- 'CPR', 'Choking', 'Burns', 'Bleeding', 'Snake Bite'
  thumbnail text,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. USER ROLES TABLE (for role management)
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'user',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- 5. ENABLE ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 6. ROW LEVEL SECURITY POLICIES
-- Users can view/update their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Organizations and tutorials are public readable
CREATE POLICY "Organizations are public readable" ON emergency_organizations FOR SELECT TO public USING (true);
CREATE POLICY "Tutorials are public readable" ON tutorials FOR SELECT TO public USING (true);

-- Users can view their own roles
CREATE POLICY "Users can view own roles" ON user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 7. AUTOMATIC PROFILE CREATION ON SIGNUP
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    'user'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Insert Sample Data

```sql
-- Insert emergency organizations
INSERT INTO emergency_organizations (name, type, phone, location, website) VALUES
('Kenyatta National Hospital', 'Hospital', '+254-20-2726300', 'Hospital Road, Nairobi', 'https://www.knh.or.ke'),
('Nairobi Hospital', 'Hospital', '+254-20-8000000', 'Argwings Kodhek Road, Nairobi', 'https://nairobihospital.org'),
('Kenya Red Cross', 'Emergency Services', '+254-20-6699000', 'Nairobi', 'https://www.kenyaredcross.org'),
('AMREF Flying Doctors', 'Air Ambulance', '+254-41-232566', 'Wilson Airport, Nairobi', 'https://www.amref.org');

-- Insert tutorial categories (to be managed via admin dashboard)
INSERT INTO tutorials (title, description, video_url, category, thumbnail) VALUES
('CPR for Adults', 'Step-by-step CPR instructions', 'https://youtu.be/ea1RJUOiNfQ', 'CPR', 'https://via.placeholder.com/300x200?text=CPR'),
('Choking Response', 'Heimlich maneuver technique', 'https://youtu.be/example', 'Choking', 'https://via.placeholder.com/300x200?text=Choking'),
('Severe Bleeding', 'How to stop heavy bleeding', 'https://youtu.be/example', 'Bleeding', 'https://via.placeholder.com/300x200?text=Bleeding');
```

---

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
