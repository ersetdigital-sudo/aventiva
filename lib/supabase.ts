import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Project URL Supabase (Dashboard → Project Settings → API). */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/** Kunci publishable (sbp_…) — aman diekspos ke browser. Bukan secret key. */
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

/** false bila env belum diisi → semua fitur jatuh ke mode statis/offline. */
export const supabaseEnabled = Boolean(SUPABASE_URL && SUPABASE_KEY);

let browserClient: SupabaseClient | null = null;

/** Klien browser (singleton). Null kalau Supabase belum dikonfigurasi. */
export function getSupabase(): SupabaseClient | null {
  if (!supabaseEnabled) return null;
  if (!browserClient) {
    browserClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return browserClient;
}

/** Klien untuk kode server (route handler / server component). */
export function createServerSupabase(): SupabaseClient | null {
  if (!supabaseEnabled) return null;
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Bucket publik untuk aset (gambar QRIS, dst). */
export const ASSET_BUCKET = "assets";

/** URL publik gambar QRIS. 404 kalau belum pernah di-upload. */
export function qrisUrl(): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${ASSET_BUCKET}/qris.png`;
}
