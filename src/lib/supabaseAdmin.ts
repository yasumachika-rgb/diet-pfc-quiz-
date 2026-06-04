import { createClient } from "@supabase/supabase-js";

// Server-only client. Uses the service-role key so the database can stay
// fully locked down with RLS (no public read/write policies needed).
// Returns null when env vars are absent so the app still runs without a DB.
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
