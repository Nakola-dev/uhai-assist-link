# Admin Account Setup Instructions

## Creating the Admin Account

Since the admin account requires authentication through Supabase Auth, please follow these steps:

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://zxsvdbtyzbgkmavbdxdg.supabase.co
2. Navigate to **Authentication** → **Users**
3. Click **Add User** → **Create new user**
4. Enter the following details:
   - **Email**: `admin@gmail.com`
   - **Password**: `admin.123`
   - **Auto Confirm User**: ✅ (checked)
5. Click **Create user**

6. After user creation, go to **SQL Editor** and run:
   ```sql
   -- Update the newly created user to have admin role
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'admin@gmail.com';
   ```

### Option 2: Via Application Registration

1. Start the application
2. Navigate to `/auth?signup=true`
3. Register with:
   - Email: `admin@gmail.com`
   - Password: `admin.123`
   - Full Name: System Administrator
   - Phone: +254700000000

4. After registration, run this SQL in Supabase SQL Editor:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'admin@gmail.com';
   ```

## Verifying Admin Access

1. Sign in at `/auth` with `admin@gmail.com` / `admin.123`
2. You should be redirected to `/dashboard/admin`
3. Verify you can access admin features:
   - Manage Emergency Organizations
   - Manage First Aid Tutorials
   - View user statistics

## Database Schema

The profiles table structure:

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',  -- enum: 'admin' | 'user'
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Troubleshooting

### Profile not created automatically
If the profile wasn't created automatically during signup, run:
```sql
INSERT INTO public.profiles (id, email, role, full_name, phone)
SELECT
  id,
  email,
  'admin'::app_role,
  'System Administrator',
  '+254700000000'
FROM auth.users
WHERE email = 'admin@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin';
```

### User roles not synced
```sql
-- Ensure user_roles is synced with profile
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'admin@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
```
