// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types'; // Optional: if using generated types

// ──────────────────────────────────────────────────────────────
// Environment Variables (Vite)
// ──────────────────────────────────────────────────────────────
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate required env vars
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables!\n' +
    'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env'
  );
  throw new Error('Supabase configuration is missing. Check your .env file.');
}

// ──────────────────────────────────────────────────────────────
// Supabase Client (Public Schema + Auth Persistence)
// ──────────────────────────────────────────────────────────────
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage, // Optional: use sessionStorage if preferred
  },
  db: {
    schema: 'public', // Critical: matches your tables (profiles, tutorials, etc.)
  },
  global: {
    headers: {
      'X-Client-Info': 'uhailink-web/v1.0.0',
    },
  },
});

// ──────────────────────────────────────────────────────────────
// Optional: Debug Logging (Dev Only)
// ──────────────────────────────────────────────────────────────
if (import.meta.env.DEV) {
  supabase
    .onAuthStateChange((event, session) => {
      console.log('[Supabase Auth] Event:', event, 'User:', session?.user?.email ?? 'none');
    })
    .data.subscription;
}

// ──────────────────────────────────────────────────────────────
// Export for convenience (optional)
// ──────────────────────────────────────────────────────────────
export type { Database };