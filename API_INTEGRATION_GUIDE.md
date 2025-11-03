# Uhai Assist - API Integration Guide

## Quick Start

The application is fully integrated with Supabase. All REST APIs are automatically generated and available through the Supabase client.

### Import Supabase Client

```typescript
import { supabase } from '@/integrations/supabase/client';
```

## Common Operations

### Authentication

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Get current session
const { data: { session } } = await supabase.auth.getSession();

// Sign out
await supabase.auth.signOut();

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event);
  console.log('Session:', session);
});
```

### Profile Management

```typescript
// Get own profile
const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', session.user.id)
  .maybeSingle();

// Update profile
const { data, error } = await supabase
  .from('profiles')
  .update({
    full_name: 'John Doe',
    phone: '+254712345678',
    date_of_birth: '1990-01-01'
  })
  .eq('id', session.user.id)
  .select()
  .single();

// Admin: Get all profiles
const { data: allProfiles } = await supabase
  .from('profiles')
  .select('*')
  .eq('role', 'user');
```

### Medical Profile

```typescript
// Get medical profile
const { data: medical, error } = await supabase
  .from('medical_profiles')
  .select('*')
  .eq('user_id', session.user.id)
  .maybeSingle();

// Update medical profile
const { data, error } = await supabase
  .from('medical_profiles')
  .update({
    blood_type: 'O+',
    allergies: 'Penicillin',
    medications: 'Aspirin',
    chronic_conditions: 'Diabetes'
  })
  .eq('user_id', session.user.id)
  .select()
  .single();
```

### Emergency Contacts

```typescript
// Get emergency contacts
const { data: contacts } = await supabase
  .from('emergency_contacts')
  .select('*')
  .eq('user_id', session.user.id)
  .order('is_primary', { ascending: false });

// Add emergency contact
const { data: newContact, error } = await supabase
  .from('emergency_contacts')
  .insert([{
    user_id: session.user.id,
    name: 'Jane Doe',
    relationship: 'Sister',
    phone: '+254712345679',
    is_primary: true
  }])
  .select()
  .single();

// Update emergency contact
const { data, error } = await supabase
  .from('emergency_contacts')
  .update({ is_primary: false })
  .eq('id', contactId)
  .select()
  .single();

// Delete emergency contact
const { error } = await supabase
  .from('emergency_contacts')
  .delete()
  .eq('id', contactId);
```

### Emergency Organizations

```typescript
// Get all organizations
const { data: organizations } = await supabase
  .from('emergency_organizations')
  .select('*')
  .order('created_at', { ascending: false });

// Filter by type
const { data: hospitals } = await supabase
  .from('emergency_organizations')
  .select('*')
  .eq('type', 'Hospital');

// Admin: Add organization
const { data: newOrg, error } = await supabase
  .from('emergency_organizations')
  .insert([{
    name: 'Kisii Teaching Hospital',
    type: 'Hospital',
    phone: '+254-58-20265',
    location: 'Kisii, Kenya',
    website: 'https://kisii-hospital.or.ke'
  }])
  .select()
  .single();

// Admin: Update organization
const { data, error } = await supabase
  .from('emergency_organizations')
  .update({ phone: '+254-58-20266' })
  .eq('id', orgId)
  .select()
  .single();

// Admin: Delete organization
const { error } = await supabase
  .from('emergency_organizations')
  .delete()
  .eq('id', orgId);
```

### Tutorials

```typescript
// Get all tutorials
const { data: tutorials } = await supabase
  .from('tutorials')
  .select('*')
  .order('created_at', { ascending: false });

// Filter by category
const { data: cprTutorials } = await supabase
  .from('tutorials')
  .select('*')
  .eq('category', 'CPR');

// Get unique categories
const { data: categoriesData } = await supabase
  .from('tutorials')
  .select('category')
  .distinct();

// Admin: Add tutorial
const { data: newTutorial, error } = await supabase
  .from('tutorials')
  .insert([{
    title: 'Recovery Position',
    description: 'Learn the recovery position for unconscious people',
    video_url: 'https://youtube.com/watch?v=xxx',
    category: 'CPR',
    thumbnail: 'https://img.youtube.com/vi/xxx/maxresdefault.jpg'
  }])
  .select()
  .single();

// Admin: Update tutorial
const { data, error } = await supabase
  .from('tutorials')
  .update({ title: 'Updated Title' })
  .eq('id', tutorialId)
  .select()
  .single();

// Admin: Delete tutorial
const { error } = await supabase
  .from('tutorials')
  .delete()
  .eq('id', tutorialId);
```

### QR Access Token

```typescript
// Get own QR token
const { data: qrToken, error } = await supabase
  .from('qr_access_tokens')
  .select('*')
  .eq('user_id', session.user.id)
  .maybeSingle();

// Deactivate QR token
const { data, error } = await supabase
  .from('qr_access_tokens')
  .update({ is_active: false })
  .eq('user_id', session.user.id)
  .select()
  .single();

// Reactivate QR token
const { data, error } = await supabase
  .from('qr_access_tokens')
  .update({ is_active: true })
  .eq('user_id', session.user.id)
  .select()
  .single();
```

### Access Medical Data via QR Token

```typescript
// Get medical profile using QR token (no auth required)
const { data: medical } = await supabase
  .from('medical_profiles')
  .select('*')
  .eq('user_id', targetUserId);
// This works if QR token is active for the user

// Get emergency contacts using QR token (no auth required)
const { data: contacts } = await supabase
  .from('emergency_contacts')
  .select('*')
  .eq('user_id', targetUserId);
// This works if QR token is active for the user
```

### User Roles (Admin Only)

```typescript
// Get own roles
const { data: myRoles } = await supabase
  .from('user_roles')
  .select('*')
  .eq('user_id', session.user.id);

// Admin: Get all user roles
const { data: allRoles } = await supabase
  .from('user_roles')
  .select('*');

// Admin: Promote user to admin
const { data, error } = await supabase
  .from('user_roles')
  .insert([{
    user_id: targetUserId,
    role: 'admin'
  }])
  .select()
  .single();

// Admin: Demote admin to user
const { error } = await supabase
  .from('user_roles')
  .delete()
  .eq('user_id', targetUserId)
  .eq('role', 'admin');
```

## Error Handling

```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', session.user.id)
  .maybeSingle();

if (error) {
  console.error('Error fetching profile:', error.message);
  // Handle permission errors, network errors, etc.
}

if (data) {
  console.log('Profile:', data);
}
```

## Real-Time Subscriptions

```typescript
// Listen to profile updates
const subscription = supabase
  .channel('profiles')
  .on('postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'profiles',
      filter: `id=eq.${session.user.id}`
    },
    (payload) => {
      console.log('Profile updated:', payload);
    }
  )
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

## TypeScript Types

```typescript
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// Get row type
type Profile = Tables<'profiles'>;

// Get insert type
type ProfileInsert = TablesInsert<'profiles'>;

// Get update type
type ProfileUpdate = TablesUpdate<'profiles'>;

// Usage
const newProfile: ProfileInsert = {
  email: 'test@example.com',
  full_name: 'Test User'
};
```

## Query Building

```typescript
// Select specific columns
const { data } = await supabase
  .from('profiles')
  .select('full_name, email, phone')
  .eq('id', session.user.id)
  .single();

// Filter conditions
const { data } = await supabase
  .from('emergency_organizations')
  .select('*')
  .eq('type', 'Hospital')
  .order('name');

// Pagination
const { data } = await supabase
  .from('tutorials')
  .select('*')
  .range(0, 9); // First 10 records

// Search
const { data } = await supabase
  .from('emergency_organizations')
  .select('*')
  .ilike('name', '%Hospital%');
```

## Batch Operations

```typescript
// Insert multiple emergency contacts
const { data, error } = await supabase
  .from('emergency_contacts')
  .insert([
    {
      user_id: session.user.id,
      name: 'John Doe',
      relationship: 'Brother',
      phone: '+254712345678'
    },
    {
      user_id: session.user.id,
      name: 'Jane Doe',
      relationship: 'Sister',
      phone: '+254712345679'
    }
  ])
  .select();

// Update multiple records
const { data, error } = await supabase
  .from('emergency_contacts')
  .update({ is_primary: false })
  .eq('user_id', session.user.id)
  .select();
```

## Best Practices

1. **Use `.maybeSingle()`** for queries that might return zero rows
   ```typescript
   .maybeSingle(); // Returns data: null if no match
   .single();      // Throws error if no match
   ```

2. **Always handle errors**
   ```typescript
   if (error) {
     // Handle error
   }
   ```

3. **Use TypeScript types** for safety
   ```typescript
   const profile: Tables<'profiles'> = data;
   ```

4. **Keep sensitive operations server-side** (future Edge Functions)

5. **Use `.select()` to specify returned columns** for efficiency

6. **Implement proper loading states**
   ```typescript
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   setLoading(true);
   const { data, error } = await supabase...
   setLoading(false);
   if (error) setError(error.message);
   ```

## Troubleshooting

### "PGRST301: relation 'public.xxx' does not exist"
- Verify table name is correct
- Check migrations were applied: `mcp__supabase__list_migrations`

### "permission denied" errors
- Verify user is authenticated
- Check RLS policies match your access
- Verify user role for admin operations

### Realtime subscriptions not working
- Ensure Realtime is enabled in Supabase dashboard
- Check browser console for errors
- Verify table has `updated_at` column

### Type errors with TypeScript
- Regenerate types from schema
- Update `src/integrations/supabase/types.ts`
- Clear node_modules cache

## Resources

- [Supabase Client Documentation](https://supabase.com/docs/reference/javascript)
- [PostgreSQL Query Documentation](https://supabase.com/docs/guides/database/json)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
