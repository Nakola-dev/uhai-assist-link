# Uhai Assist - Database Setup & API Documentation

## Database Schema Implementation

The Uhai Assist application uses Supabase (PostgreSQL) with complete schema deployed including:
- **7 Tables**: user_roles, profiles, medical_profiles, emergency_contacts, qr_access_tokens, emergency_organizations, tutorials
- **Enum Type**: app_role (admin | user)
- **Functions**: handle_updated_at(), has_role(), handle_new_user(), sync_profile_role()
- **Triggers**: Automatic profile creation on signup, role synchronization, timestamp updates
- **RLS Policies**: Comprehensive row-level security for all tables
- **Seed Data**: 5 emergency organizations, 5 first aid tutorials pre-loaded

## Database Architecture

### Core Tables

#### 1. **profiles** (User Account Data)
```typescript
- id: UUID (PK, FK to auth.users)
- email: TEXT (UNIQUE)
- role: app_role ('admin' | 'user')
- full_name: TEXT
- phone: TEXT
- date_of_birth: DATE
- avatar_url: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ (auto-updated via trigger)
```

#### 2. **user_roles** (RBAC Management)
```typescript
- id: UUID (PK)
- user_id: UUID (FK to auth.users)
- role: app_role
- created_at: TIMESTAMPTZ
- UNIQUE (user_id, role)
```

#### 3. **medical_profiles** (Health Data)
```typescript
- id: UUID (PK)
- user_id: UUID (FK, UNIQUE)
- blood_type: TEXT ('A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-')
- allergies: TEXT
- medications: TEXT
- chronic_conditions: TEXT
- additional_notes: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### 4. **emergency_contacts** (Emergency Directory)
```typescript
- id: UUID (PK)
- user_id: UUID (FK)
- name: TEXT
- relationship: TEXT
- phone: TEXT
- is_primary: BOOLEAN (default: false)
- created_at: TIMESTAMPTZ
```

#### 5. **qr_access_tokens** (QR Code Access Control)
```typescript
- id: UUID (PK)
- user_id: UUID (FK, UNIQUE)
- access_token: TEXT (UNIQUE)
- is_active: BOOLEAN (default: true)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### 6. **emergency_organizations** (Hospital Directory)
```typescript
- id: UUID (PK)
- name: TEXT
- type: TEXT
- phone: TEXT
- location: TEXT
- website: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### 7. **tutorials** (First Aid Videos)
```typescript
- id: UUID (PK)
- title: TEXT
- description: TEXT
- video_url: TEXT
- category: TEXT
- thumbnail: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

## REST API Endpoints

Supabase automatically generates REST APIs for all tables. All endpoints use JWT authentication via the Supabase SDK.

### Authentication Required (Authenticated Users)

#### Profiles
- `GET /rest/v1/profiles?select=*` - Get own profile (RLS enforced)
- `PATCH /rest/v1/profiles?id=eq.{user_id}` - Update own profile
- `GET /rest/v1/profiles?id=eq.{user_id}&select=*` - Admins can view any profile

#### Medical Profiles
- `GET /rest/v1/medical_profiles?user_id=eq.{user_id}&select=*` - Get own medical data
- `POST /rest/v1/medical_profiles` - Create medical profile
- `PATCH /rest/v1/medical_profiles?user_id=eq.{user_id}` - Update medical data

#### Emergency Contacts
- `GET /rest/v1/emergency_contacts?user_id=eq.{user_id}&select=*` - Get own contacts
- `POST /rest/v1/emergency_contacts` - Add emergency contact
- `PATCH /rest/v1/emergency_contacts?id=eq.{contact_id}` - Update contact
- `DELETE /rest/v1/emergency_contacts?id=eq.{contact_id}` - Delete contact

#### QR Access Tokens
- `GET /rest/v1/qr_access_tokens?user_id=eq.{user_id}&select=*` - Get own QR token
- `PATCH /rest/v1/qr_access_tokens?user_id=eq.{user_id}` - Toggle token active status

### Public/Authenticated Read Access

#### Emergency Organizations
- `GET /rest/v1/emergency_organizations?select=*` - List all organizations (any authenticated user)
- `GET /rest/v1/emergency_organizations?type=eq.Hospital&select=*` - Filter by type

#### Tutorials
- `GET /rest/v1/tutorials?select=*` - List all tutorials
- `GET /rest/v1/tutorials?category=eq.CPR&select=*` - Filter by category

### Admin-Only Operations

#### Organizations (Admin)
- `POST /rest/v1/emergency_organizations` - Add organization (admin only)
- `PATCH /rest/v1/emergency_organizations?id=eq.{org_id}` - Update organization (admin only)
- `DELETE /rest/v1/emergency_organizations?id=eq.{org_id}` - Delete organization (admin only)

#### Tutorials (Admin)
- `POST /rest/v1/tutorials` - Add tutorial (admin only)
- `PATCH /rest/v1/tutorials?id=eq.{tutorial_id}` - Update tutorial (admin only)
- `DELETE /rest/v1/tutorials?id=eq.{tutorial_id}` - Delete tutorial (admin only)

#### User Roles (Admin)
- `GET /rest/v1/user_roles?select=*` - View all roles (admin only)
- `POST /rest/v1/user_roles` - Assign role (admin only)
- `DELETE /rest/v1/user_roles?user_id=eq.{user_id}&role=eq.admin` - Remove role (admin only)

## Row Level Security (RLS) Policies

### Profiles Table
- **users_view_own_profile**: Users can SELECT their own profile only
- **admins_view_all_profiles**: Admins can SELECT all profiles
- **users_update_own_profile**: Users can UPDATE their own profile (role cannot be changed)
- **admins_update_all_profiles**: Admins can UPDATE any profile

### Medical Profiles Table
- **owner_medical_all**: Users have full CRUD access to their own medical data
- **public_medical_via_qr**: Anyone with valid QR token can READ medical data

### Emergency Contacts Table
- **owner_contacts_all**: Users have full CRUD access to their own contacts
- **public_contacts_via_qr**: Anyone with valid QR token can READ contacts

### QR Access Tokens Table
- **owner_qr_all**: Users have full CRUD access to their own QR token

### Emergency Organizations Table
- **public_read_orgs**: All authenticated users can READ
- **admin_insert_orgs**: Admins can INSERT
- **admin_update_orgs**: Admins can UPDATE
- **admin_delete_orgs**: Admins can DELETE

### Tutorials Table
- **public_read_tutorials**: All authenticated users can READ
- **admin_insert_tutorials**: Admins can INSERT
- **admin_update_tutorials**: Admins can UPDATE
- **admin_delete_tutorials**: Admins can DELETE

## Automatic Triggers

### 1. handle_new_user() - Profile Auto-Creation
Automatically runs on user signup:
- Creates profile row with email and metadata
- Assigns 'user' role
- Creates empty medical profile
- Generates QR access token

### 2. sync_profile_role() - Role Synchronization
When profile.role is updated:
- Syncs role to user_roles table
- Maintains RBAC consistency

### 3. handle_updated_at() - Timestamp Management
Automatically updates `updated_at` field before any UPDATE operation.

## Environment Variables

```bash
# .env
VITE_SUPABASE_URL=https://yzghcrbxuyczjxjlydnw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Z2hjcmJ4dXljemp4amx5ZG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNjA3MjIsImV4cCI6MjA3NzczNjcyMn0.AidD0hYlEfsVFQ0j-i570IgzTBT1PQSzL3WJMvIItIc
VITE_OPENROUTER_API_KEY=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
```

## Usage Examples

### Using Supabase Client in React

```typescript
import { supabase } from '@/integrations/supabase/client';

// Fetch own profile
const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', session.user.id)
  .maybeSingle();

// Get all tutorials
const { data: tutorials } = await supabase
  .from('tutorials')
  .select('*')
  .order('created_at', { ascending: false });

// Create emergency contact
const { data, error } = await supabase
  .from('emergency_contacts')
  .insert([{
    user_id: session.user.id,
    name: 'John Doe',
    relationship: 'Brother',
    phone: '+254712345678',
    is_primary: true
  }])
  .select()
  .single();

// List organizations by type
const { data: hospitals } = await supabase
  .from('emergency_organizations')
  .select('*')
  .eq('type', 'Hospital');
```

## Data Safety & Security

- All user data is encrypted in transit via HTTPS
- Row Level Security prevents unauthorized access
- QR tokens provide temporary public access to medical profiles
- Admin users have elevated permissions via role-based policies
- Automatic triggers maintain data consistency
- Timestamps tracked for audit purposes

## Seed Data

### Emergency Organizations (5 pre-loaded)
1. Kenyatta National Hospital - Hospital, Nairobi
2. Nairobi Hospital - Hospital, Nairobi
3. Aga Khan University Hospital - Hospital, Nairobi
4. Kenya Red Cross - Emergency Services, Nairobi
5. AMREF Flying Doctors - Air Ambulance, Nairobi

### First Aid Tutorials (5 pre-loaded)
1. CPR - Cardiopulmonary Resuscitation (CPR)
2. How to Help a Choking Person (Choking)
3. First Aid for Burns (Burns)
4. Treating Severe Bleeding (Bleeding)
5. How to Treat a Snake Bite (Snake Bite)

## Migration Files

All schema is defined in migration files for reproducibility:
- `20251103094920_01_create_tables_and_enums.sql` - Tables and enum types
- `20251103094939_02_create_functions_and_triggers.sql` - Functions and triggers
- `20251103095001_03_enable_rls_and_policies.sql` - RLS policies
- `20251103095021_04_seed_initial_data.sql` - Seed data

## Database Backup & Recovery

All data is automatically backed up by Supabase. Access backups via Supabase Dashboard > Backups.

## Testing the Database

```bash
# Verify tables exist
npm run dev

# Check Supabase dashboard
# URL: https://app.supabase.com/project/yzghcrbxuyczjxjlydnw/

# Test via API
curl -X GET 'https://yzghcrbxuyczjxjlydnw.supabase.co/rest/v1/tutorials?select=*' \
  -H "apikey: $VITE_SUPABASE_ANON_KEY"
```

## References

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
