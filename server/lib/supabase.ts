// server/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const BASE_AUTH_OPTIONS = {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
} as const;

// Lê as vars no momento da chamada, não do import
export function createSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL ou SUPABASE_ANON_KEY não definidas");
  return createClient(url, key, BASE_AUTH_OPTIONS);
}

export function createSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidas");
  return createClient(url, key, BASE_AUTH_OPTIONS);
}