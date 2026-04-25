import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazily initialised so the module can be imported at build time without real credentials.
let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  return url;
}

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!anonKey) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
    _supabase = createClient(getSupabaseUrl(), anonKey);
  }
  return _supabase;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
    _supabaseAdmin = createClient(getSupabaseUrl(), serviceKey);
  }
  return _supabaseAdmin;
}

// Convenience proxy objects that behave like the original exports
// but instantiate the client on first property access.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as any)[prop];
  },
});

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseAdmin() as any)[prop];
  },
});
