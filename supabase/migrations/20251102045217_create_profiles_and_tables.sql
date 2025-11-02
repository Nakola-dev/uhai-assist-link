/*
  # Create Profiles, Organizations, Tutorials, and User Roles Tables

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, links to auth.users)
      - `full_name` (text)
      - `phone` (text)
      - `role` (text, default 'user')
      - `created_at` (timestamp, default now())
    
    - `emergency_organizations`
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text)
      - `phone` (text)
      - `location` (text)
      - `website` (text, optional)
      - `created_at` (timestamp)
    
    - `tutorials`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `video_url` (text)
      - `category` (text)
      - `thumbnail` (text, optional)
      - `created_at` (timestamp)
    
    - `user_roles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles.id)
      - `role` (text, default 'user')
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on all tables
    - Users can read/write their own profile
    - Emergency organizations are public readable
    - Tutorials are public readable
    - User roles are user-readable
  
  3. Functions
    - Create `handle_new_user()` trigger to auto-create profile on signup
    - Prevent duplicate profiles with ON CONFLICT DO NOTHING
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  role text DEFAULT 'user',
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS emergency_organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  phone text NOT NULL,
  location text NOT NULL,
  website text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tutorials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  category text NOT NULL,
  thumbnail text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'user',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Emergency organizations are publicly readable"
  ON emergency_organizations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Tutorials are publicly readable"
  ON tutorials FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can view their own role"
  ON user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

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
