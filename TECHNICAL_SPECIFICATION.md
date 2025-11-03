# Uhai Assist - Technical Specification

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│  ├─ Authentication (Supabase Auth)                          │
│  ├─ Dashboard (User/Admin)                                  │
│  ├─ Medical Profile Management                              │
│  ├─ Emergency Contacts                                      │
│  ├─ QR Code Generation & Scanning                           │
│  └─ AI First Aid Assistant                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Supabase (PostgreSQL Database)                  │
│  ├─ REST APIs (Auto-generated)                              │
│  ├─ Authentication (JWT)                                    │
│  ├─ Row Level Security (RLS)                                │
│  ├─ Database Triggers & Functions                           │
│  └─ Realtime Subscriptions (optional)                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│         PostgreSQL (Secure Data Storage)                     │
│  ├─ 7 Core Tables                                           │
│  ├─ 1 Enum Type (app_role)                                  │
│  ├─ 4 Database Functions                                    │
│  └─ 7 Active Triggers                                       │
└─────────────────────────────────────────────────────────────┘
```

## Database Specifications

### Connection Details
- **Provider**: Supabase (Managed PostgreSQL)
- **Database**: PostgreSQL 13.0.5
- **URL**: https://yzghcrbxuyczjxjlydnw.supabase.co
- **Schema**: public
- **SSL**: Required

### Table Specifications

| Table | Rows | Indexes | Policies | Purpose |
|-------|------|---------|----------|---------|
| profiles | 0* | 2 | 4 | User account data |
| user_roles | 0* | 1 | 4 | RBAC management |
| medical_profiles | 0* | 1 | 2 | Health information |
| emergency_contacts | 0* | 1 | 2 | Emergency directory |
| qr_access_tokens | 0* | 1 | 1 | QR code access control |
| emergency_organizations | 5 | 0 | 4 | Hospital directory |
| tutorials | 5 | 0 | 4 | First aid videos |

*Auto-populated on user signup

### Constraints & Relationships

**Foreign Keys:**
- profiles.id → auth.users(id)
- user_roles.user_id → auth.users(id)
- medical_profiles.user_id → auth.users(id)
- emergency_contacts.user_id → auth.users(id)
- qr_access_tokens.user_id → auth.users(id)

**Unique Constraints:**
- profiles.email (UNIQUE)
- user_roles (user_id, role) UNIQUE
- medical_profiles.user_id (UNIQUE)
- qr_access_tokens.user_id (UNIQUE)
- qr_access_tokens.access_token (UNIQUE)

**Check Constraints:**
- profiles.role ∈ {admin, user}
- medical_profiles.blood_type ∈ {A+, A-, B+, B-, AB+, AB-, O+, O-}

## API Specifications

### REST Endpoints

**Authentication (via Supabase Auth)**
- `POST /auth/v1/signup` - Register new user
- `POST /auth/v1/token?grant_type=password` - Login
- `POST /auth/v1/logout` - Logout
- `GET /auth/v1/user` - Get current user
- `POST /auth/v1/refresh` - Refresh session

**Data Tables (auto-generated CRUD)**
```
GET    /rest/v1/{table}              - List records
GET    /rest/v1/{table}?id=eq.{id}   - Get single record
POST   /rest/v1/{table}              - Create record
PATCH  /rest/v1/{table}?id=eq.{id}   - Update record
DELETE /rest/v1/{table}?id=eq.{id}   - Delete record
```

### Request/Response Format

**Request:**
```json
{
  "Authorization": "Bearer {JWT_TOKEN}",
  "Content-Type": "application/json"
}
```

**Response:**
```json
{
  "data": [...],
  "error": null
}
```

### Query Parameters

- `select` - Column selection: `select=id,name,email`
- `eq` - Equality filter: `id=eq.123`
- `order` - Sort order: `order=created_at.desc`
- `limit` - Result limit: `limit=10`
- `offset` - Pagination offset: `offset=0`

## Security Model

### Authentication Flow

```
1. User Signup/Login
   ↓
2. Supabase Auth generates JWT
   ↓
3. JWT stored in localStorage
   ↓
4. Database trigger creates profile + roles
   ↓
5. RLS policies enforce access control
```

### JWT Structure
```
Header: {"alg": "HS256", "type": "JWT"}
Payload: {
  "iss": "supabase",
  "sub": "{user_id}",
  "aud": "authenticated",
  "exp": 1234567890,
  "iat": 1234567800
}
```

### Authorization Model

**Role-Based Access Control (RBAC)**
- `user`: Default role, access own data
- `admin`: Elevated permissions, manage platform data

**Policy Examples**

```sql
-- User can read own profile
CREATE POLICY "users_view_own_profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Admin can read all profiles
CREATE POLICY "admins_view_all_profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Public read via QR token
CREATE POLICY "public_medical_via_qr"
  ON medical_profiles FOR SELECT
  TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM qr_access_tokens
    WHERE user_id = medical_profiles.user_id
    AND is_active = true
  ));
```

## Data Models

### User Profile Model
```typescript
interface Profile {
  id: string (UUID);                    // FK to auth.users
  email: string (unique);               // User email
  role: 'user' | 'admin';               // User role
  full_name: string | null;             // Display name
  phone: string | null;                 // Contact number
  date_of_birth: string | null;         // ISO date format
  avatar_url: string | null;            // Profile image URL
  created_at: string;                   // ISO timestamp
  updated_at: string;                   // ISO timestamp
}
```

### Medical Profile Model
```typescript
interface MedicalProfile {
  id: string (UUID);                    // Primary key
  user_id: string (UUID, unique);       // FK to auth.users
  blood_type: 'A+' | 'A-' | ... | null; // Blood type
  allergies: string | null;             // Allergy list
  medications: string | null;           // Current medications
  chronic_conditions: string | null;    // Conditions list
  additional_notes: string | null;      // Free-form notes
  created_at: string;                   // ISO timestamp
  updated_at: string;                   // ISO timestamp
}
```

### Emergency Contact Model
```typescript
interface EmergencyContact {
  id: string (UUID);                    // Primary key
  user_id: string (UUID);               // FK to auth.users
  name: string;                         // Contact name
  relationship: string;                 // Relation (brother, sister, etc.)
  phone: string;                        // Phone number
  is_primary: boolean;                  // Primary contact flag
  created_at: string;                   // ISO timestamp
}
```

### QR Access Token Model
```typescript
interface QRAccessToken {
  id: string (UUID);                    // Primary key
  user_id: string (UUID, unique);       // FK to auth.users
  access_token: string (unique);        // Token string
  is_active: boolean;                   // Active status
  created_at: string;                   // ISO timestamp
  updated_at: string;                   // ISO timestamp
}
```

### Emergency Organization Model
```typescript
interface EmergencyOrganization {
  id: string (UUID);                    // Primary key
  name: string;                         // Organization name
  type: string;                         // Type (hospital, ambulance, etc.)
  phone: string;                        // Contact number
  location: string;                     // Physical location
  website: string | null;               // Website URL
  created_at: string;                   // ISO timestamp
  updated_at: string;                   // ISO timestamp
}
```

### Tutorial Model
```typescript
interface Tutorial {
  id: string (UUID);                    // Primary key
  title: string;                        // Tutorial title
  description: string;                  // Tutorial description
  video_url: string;                    // YouTube/video URL
  category: string;                     // Category (CPR, Choking, etc.)
  thumbnail: string | null;             // Thumbnail image URL
  created_at: string;                   // ISO timestamp
  updated_at: string;                   // ISO timestamp
}
```

## Performance Considerations

### Indexes

```sql
-- User roles quick lookup
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

-- Profile searches
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Medical data by user
CREATE INDEX idx_medical_user ON medical_profiles(user_id);

-- Emergency contacts by user
CREATE INDEX idx_emergency_user ON emergency_contacts(user_id);

-- QR token lookups
CREATE INDEX idx_token_active ON qr_access_tokens(access_token, is_active) WHERE is_active = true;
```

### Query Optimization

- Use `.select()` to specify columns
- Use `.eq()` for indexed filtering
- Use `.order()` with indexed columns
- Use `.range()` for pagination
- Enable query caching in client

## Scalability

### Current Capacity
- Users: Unlimited (PostgreSQL-managed)
- Organizations: 1000+ (pre-loaded: 5)
- Tutorials: 1000+ (pre-loaded: 5)
- Concurrent connections: 1000+

### Future Scaling
- Use Supabase read replicas for scaling
- Implement query result caching
- Use Realtime for live updates
- Archive old data to cold storage

## Disaster Recovery

### Backup Strategy
- Supabase automatic daily backups
- Point-in-time recovery available
- Manual backups via Supabase dashboard
- 30-day retention policy

### Restore Procedure
1. Access Supabase dashboard
2. Navigate to Backups section
3. Select restore point
4. Confirm restore (data loss occurs)
5. Verify restored data

## Compliance & Standards

### Data Protection
- GDPR: User data can be exported/deleted
- SSL/TLS: All data in transit encrypted
- At-rest encryption: Supabase managed
- ISO 27001: Supabase certified

### Standards Followed
- JWT RFC 7519: Token format
- REST API conventions: HTTP methods
- PostgreSQL best practices: Schema design
- TypeScript strict mode: Type safety

## Monitoring & Observability

### Key Metrics
- Database connection count
- Query execution time
- RLS policy evaluation
- Auth failure rate
- API response times

### Logging
- Application logs: Browser console
- Database logs: Supabase dashboard
- Auth logs: Supabase auth events
- Performance logs: Browser DevTools

## Migration Strategy

### Schema Versioning
All migrations stored in `supabase/migrations/`:
- `*_01_*.sql` - Schema creation
- `*_02_*.sql` - Functions and triggers
- `*_03_*.sql` - Security policies
- `*_04_*.sql` - Seed data

### Rollback Procedure
1. Identify migration to rollback
2. Drop dependent objects (triggers, policies)
3. Reverse schema changes
4. Reapply dependent objects

## Testing Specifications

### Unit Tests
- Model validation
- Type definitions
- API response parsing

### Integration Tests
- Authentication flow
- Database operations
- RLS policy enforcement

### E2E Tests
- User signup/login
- Profile creation
- QR code generation
- Medical profile updates

## References

- Supabase Docs: https://supabase.com/docs
- PostgreSQL 13: https://www.postgresql.org/docs/13/
- REST API Standards: https://restfulapi.net/
- JWT Specification: https://tools.ietf.org/html/rfc7519

---

**Last Updated**: 2025-11-03
**Version**: 1.0.0
**Status**: Production Ready
