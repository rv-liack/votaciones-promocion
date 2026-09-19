import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Cliente Supabase con la anon key pública.
// NUNCA uses la service_role key en el frontend.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;
if (url && anonKey) {
  client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getSupabase(): SupabaseClient {
  if (!client) {
    throw new Error('connect');
  }
  return client;
}
