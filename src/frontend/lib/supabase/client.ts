import { createClient } from '@supabase/supabase-js';

import { env } from '@/lib/env/env';

export function createSupabaseClient() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Configure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }

  return createClient(env.supabaseUrl, env.supabaseAnonKey);
}
