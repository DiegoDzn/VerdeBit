import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { env } from '@/lib/env/env';

function buildClient(): SupabaseClient {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error(
      'Faltan variables de entorno de Supabase. Configura EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY en src/frontend/.env.',
    );
  }

  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

export const supabase = buildClient();
