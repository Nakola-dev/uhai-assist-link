# 🆘 Uhai Assist — AI Smart Emergency Response System

> **When Every Second Counts, AI Responds**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://uhai-assist.lovable.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable-ff69b4)](https://lovable.dev)

A full-stack web-based emergency assistance platform built to save lives in Kenya and across Africa through AI-guided first aid instructions, QR-coded medical identity, and instant access to rescue services.

---

## 📋 Table of Contents
- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
- [Environment Setup](#-environment-setup)
- [Deployment](#-deployment)
- [User Roles](#-user-roles)
- [Security](#-security)
- [Contributing](#-contributing)
- [Roadmap](#-roadmap)
- [Team](#-team)
- [License](#-license)

---

## 🚑 The Problem

Every year, **thousands of people die in Kenya** because:

- ❌ **Bystanders don't know what to do** during medical emergencies
- ❌ **Medical responders lack instant victim information** (blood type, allergies, conditions)
- ❌ **Emergency contacts cannot be reached quickly**
- ❌ **Hospitals receive late or incomplete critical patient data**

**These delays cost lives.**

---

## ✅ Our Solution

Uhai Assist provides **real-time, AI-powered emergency support** accessible from any device:

### 🎯 Core Value Proposition
- **Instant AI guidance** for bystanders during emergencies
- **QR medical ID system** for immediate access to critical patient information
- **Centralized emergency contacts** directory (hospitals, Red Cross, AMREF)
- **Secure medical profiles** with encryption and privacy controls
- **Mobile-first design** optimized for low-bandwidth African networks

---

## ⭐ Key Features

### 1. 🤖 AI-Guided First Aid Assistant
- Real-time conversational AI providing step-by-step emergency instructions
- Covers CPR, choking, burns, bleeding, fractures, and more
- Powered by advanced AI models optimized for medical guidance
- Context-aware responses based on emergency type

### 2. 📱 QR Medical ID Wristband System
- Generate secure QR codes containing encrypted medical information
- Scan QR codes to instantly access patient data during emergencies
- Time-limited access tokens for privacy protection
- Includes blood type, allergies, chronic conditions, current medications

### 3. 🏥 Emergency Contacts Directory
- Pre-loaded with major Nairobi hospitals and emergency services
- Direct call functionality and website links
- Red Cross, AMREF, and St. John Ambulance contacts
- Regularly updated contact information

### 4. 👤 User Medical Profile Management
- Comprehensive health information storage
- Emergency contact management (multiple contacts supported)
- Secure and encrypted data storage
- Easy profile updates and QR code regeneration

### 5. 🎓 First Aid Tutorials Library
- Categorized by emergency type (Choking, Bleeding, Fractures, etc.)
- Video tutorials and written instructions
- Searchable and filterable content
- Admin-managed content updates

### 6. 🛡️ Admin Dashboard
- Manage first aid tutorials and educational content
- Update emergency organization contacts
- Monitor system usage and analytics
- Content moderation and quality control

---

## 🛠 Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework with hooks and modern patterns |
| **TypeScript** | Type-safe development and better IDE support |
| **Vite** | Lightning-fast build tool and dev server |
| **Tailwind CSS** | Utility-first styling with custom design system |
| **React Router v6** | Client-side routing and navigation |
| **TanStack Query** | Server state management and caching |
| **Radix UI** | Accessible component primitives |
| **Shadcn/ui** | Beautiful, customizable UI components |

### Backend (Lovable Cloud / Supabase)
| Technology | Purpose |
|------------|---------|
| **Supabase** | Backend-as-a-Service platform |
| **PostgreSQL** | Relational database with RLS policies |
| **Row Level Security (RLS)** | Database-level access control |
| **Supabase Auth** | User authentication and session management |
| **Edge Functions** | Serverless API endpoints |
| **Supabase Storage** | File storage for profile images and assets |

### AI & Integration
| Technology | Purpose |
|------------|---------|
| **DEEPSEEK R1** | AI chat assistant integration |
| **QRCode.react** | QR code generation for medical IDs |
| **Lucide React** | Modern icon library |
| **Sonner & React-Toastify** | User notifications and toasts |

### Security
- **AES-256 Encryption** for sensitive medical data
- **JWT Tokens** for authentication
- **HTTPS Enforced** on all connections
- **Role-Based Access Control (RBAC)** with separate user roles table
- **Environment Variable Protection** for API keys

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                 │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │  Landing │  │   Auth   │  │Dashboard │  │   Admin    │ │
│  │   Page   │  │  Login/  │  │  (User)  │  │ Dashboard  │ │
│  │          │  │  Signup  │  │          │  │            │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘ │
│                                                             │
│  ┌──────────────────┐  ┌─────────────┐  ┌──────────────┐  │
│  │  Emergency Chat  │  │ QR Scanner/ │  │   Profile    │  │
│  │   (AI Assistant) │  │  Generator  │  │     View     │  │
│  └──────────────────┘  └─────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│              LOVABLE CLOUD / SUPABASE BACKEND               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌──────────────────┐                │
│  │  Auth Service   │  │   PostgreSQL DB  │                │
│  │  - JWT Tokens   │  │   - user_roles   │                │
│  │  - Sessions     │  │   - profiles     │                │
│  │  - Email Auth   │  │   - medical_data │                │
│  └─────────────────┘  │   - tutorials    │                │
│                       │   - organizations│                │
│  ┌─────────────────┐  │   - qr_tokens    │                │
│  │ Edge Functions  │  └──────────────────┘                │
│  │ - emergency-chat│                                       │
│  │ - ai-assistant  │  ┌──────────────────┐                │
│  └─────────────────┘  │  Storage Bucket  │                │
│                       │  - avatars       │                │
│  ┌─────────────────┐  │  - documents     │                │
│  │  RLS Policies   │  └──────────────────┘                │
│  │  (Security)     │                                       │
│  └─────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌─────────────────┐  ┌───────────────┐ │
│  │  Lovable AI  │  │  Emergency Orgs │  │   Hospital    │ │
│  │   Models     │  │  - Red Cross    │  │   Systems     │ │
│  └──────────────┘  │  - AMREF        │  └───────────────┘ │
│                    │  - St. John     │                     │
│                    └─────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **bun** package manager
- **Git** for version control
- **BOLT.NEW Cloud account** (for backend services)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Nakola-dev/uhai-assist-link.git
cd uhai-assist-link
```

### 2️⃣ Install Dependencies
```bash
npm install
# or
bun install
```

### 3️⃣ Environment Configuration
The `.env` file is automatically managed by BOLT.NEW Cloud. It includes:
```env
VITE_SUPABASE_URL=<auto-configured>
VITE_SUPABASE_PUBLISHABLE_KEY=<auto-configured>
VITE_SUPABASE_PROJECT_ID=<auto-configured>
```

**Note:** These variables are automatically set when you enable Lovable Cloud. No manual configuration needed.

### 4️⃣ Start Development Server
```bash
npm run dev
# or
bun run dev
```

The app will be available at `http://localhost:8080`

---

## 🔧 Environment Setup

### Bolt.new Cloud Setup
This project uses **Bolt.new** for backend services (powered by Supabase):

1. **Automatic Backend Provisioning**
   - Database, authentication, and storage are automatically configured
   - No need to create a separate Supabase account

2. **Database Tables** (Auto-created via migrations)
   - `user_roles` - Role-based access control
   - `profiles` - Extended user information
   - `medical_profiles` - Encrypted medical data
   - `emergency_contacts` - User emergency contacts
   - `qr_access_tokens` - Temporary QR access tokens
   - `emergency_organizations` - Hospital and service contacts
   - `tutorials` - First aid educational content

3. **Row Level Security (RLS)**
   - All tables have RLS enabled
   - Users can only access their own data
   - Admins have elevated privileges via `user_roles` table

---

## 📦 Deployment

### Deploy to Production

#### Using BOLT.NEW (Recommended)
1. Click the **"Publish"** button in Lovable
2. Your app is deployed automatically to `<your-project>.lovable.app`
3. Custom domains can be configured in project settings

#### Manual Deployment (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Manual Deployment (Netlify)
```bash
# Build the project
npm run build

# Deploy the 'dist' folder to Netlify
```

### Environment Variables in Production


---

## 👥 User Roles

| Role | Access Level | Capabilities |
|------|-------------|--------------|
| **User** | Standard | - Create/manage medical profile<br>- Generate QR codes<br>- Access AI first aid assistant<br>- View emergency contacts<br>- Add emergency contacts |
| **Admin** | Elevated | - All user capabilities<br>- Manage first aid tutorials<br>- Update emergency organization contacts<br>- View system analytics<br>- Content moderation |

### Creating Admin Users
1. User signs up through the normal registration flow
2. Admin manually updates `user_roles` table in Lovable Cloud dashboard
3. Set `role = 'admin'` for the specific `user_id`

**Security Note:** Admin privileges are **never** stored in localStorage or client-side storage. All role checks are server-side via RLS policies.


---

## 🔐 Security

Uhai Assist implements **enterprise-grade security** for handling sensitive medical data:

### Security Measures
- ✅ **AES-256 Encryption** for medical profiles at rest
- ✅ **HTTPS Enforced** on all connections (TLS 1.3)
- ✅ **JWT Authentication** with automatic token refresh
- ✅ **Row Level Security (RLS)** on all database tables
- ✅ **Role-Based Access Control (RBAC)** with dedicated `user_roles` table
- ✅ **SQL Injection Prevention** via parameterized queries
- ✅ **XSS Protection** with Content Security Policy headers
- ✅ **CSRF Protection** on all state-changing operations

### Data Privacy
- Medical information is **never** shared without explicit user consent
- QR access tokens are **time-limited** and expire after use
- User data is **isolated** via RLS policies
- Audit logs track all data access attempts

### Compliance
- GDPR-compliant data handling
- HIPAA-inspired security practices
- Kenya Data Protection Act (2019) alignment

---

## 🤝 Contributing

We welcome contributions from developers, first-aid professionals, and emergency service providers!

### Development Team Workflow

#### For Team Members
```bash
# 1. Clone the repository
git clone https://github.com/Nakola-dev/uhai-assist-link.git
cd uhai-assist-link

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes and commit
git add .
git commit -m "feat: Add your feature description"

# 4. Push to the repository
git push origin feature/your-feature-name

# 5. Create a Pull Request
# - Go to GitHub and create a PR
# - Request review from team members
# - Address any feedback
```

### Contribution Guidelines
- ✅ Follow the existing code style (ESLint + Prettier configured)
- ✅ Write clear commit messages using [Conventional Commits](https://www.conventionalcommits.org/)
- ✅ Test your changes thoroughly before submitting PR
- ✅ Update documentation if you add new features
- ✅ Keep PRs focused - one feature/fix per PR

### Commit Message Format
```
type(scope): description

Examples:
feat(auth): Add Google OAuth login
fix(qr): Resolve QR code generation error
docs(readme): Update deployment instructions
style(ui): Improve button hover states
```

### Areas We Need Help With
- 🏥 **Medical Content**: First aid tutorial validation
- 🌍 **Localization**: Swahili and other Kenyan language translations
- 📱 **Mobile Testing**: iOS and Android browser compatibility
- 🎨 **UI/UX**: Accessibility improvements
- 🔒 **Security**: Penetration testing and vulnerability reports

---

## 🛣 Roadmap

### ✅ Completed Features (Phase 1)
- [x] AI-guided first aid chat assistant
- [x] QR medical ID generation and scanning
- [x] User authentication and profiles
- [x] Medical profile management
- [x] Emergency contacts directory
- [x] Admin dashboard for content management
- [x] Responsive mobile-first design

### 🔄 In Progress (Phase 2)
- [ ] UI/UX enhancements with animations
- [ ] Advanced search and filtering
- [ ] Push notifications for emergency alerts
- [ ] Multi-language support (Swahili, English)

### 🔜 Planned Features (Phase 3)
- [ ] **Offline Mode** - Progressive Web App (PWA) with service workers
- [ ] **SMS Fallback** - USSD integration for low-network areas
- [ ] **Voice Commands** - Voice-activated emergency help
- [ ] **Geolocation** - Automatic nearest hospital finder with maps
- [ ] **Ambulance Integration** - Direct EMS dispatch API
- [ ] **Wearable Support** - Smartwatch emergency button integration

### 🚀 Future Collaboration
- [ ] Integration with Kenya Red Cross EMS systems
- [ ] Partnership with AMREF Flying Doctors
- [ ] St. John Ambulance API connectivity
- [ ] Government health ministry data sharing
- [ ] Insurance provider integration for faster claims

---

## 📱 Screenshots

### Landing Page
*AI-powered emergency response platform homepage*

### User Dashboard
*Quick access to emergency tools and medical profile*

### AI Chat Assistant
*Real-time first aid guidance for emergencies*

### QR Medical ID
*Instant access to critical patient information*

### Admin Dashboard
*Content management and system monitoring*

> **Note:** Screenshots to be added in next update

---

## 👨‍💻 Authors & Team

**Uhai Assist Development Team**

### Team Members
- **Project Lead & Full-Stack Developer**: [Your Name]
- **Frontend Developer**: [Team Member]
- **Backend Developer**: [Team Member]
- **UI/UX Designer**: [Team Member]
- **Medical Content Advisor**: [Team Member]

### Institution
**KCA University**  
School of Computing and Information Technology  
2025

### Acknowledgments
- KCA University faculty for guidance and support
- Medical professionals who provided first aid content validation
- Beta testers from Nairobi communities
- Lovable platform for rapid development tools

---

## 📄 License

MIT License © 2025 Uhai Assist Development Team

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

## 📞 Contact & Support

- **Email**: uhai.assist@kcau.ac.ke
- **GitHub Issues**: [Report a bug](https://github.com/Nakola-dev/uhai-assist-link/issues)
- **Demo**: [uhai-assist.lovable.app](https://uhai-assist.lovable.app)

---

## 🌍 Built for Kenya, Designed for Africa

- ✅ **Mobile-first design** optimized for African internet speeds
- ✅ **Works on low bandwidth** (2G/3G compatible)
- ✅ **Local emergency institutions** pre-configured
- ✅ **Real-world tested** in high-stress environments
- ✅ **Community-driven** with local language support coming soon

### Our Mission
> **Uhai = Life** in Swahili  
> Our mission is to protect it, one emergency at a time.

---

**⭐ If this project helps you or someone you know, please star this repository!**

**🚨 In case of real emergency, always call 999 (Kenya Emergency Number) first!**
