import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, createServerSupabase, supabaseEnabled } from "./supabase";

/**
 * Klien Supabase memakai KUNCI RAHASIA server (sb_secret_…).
 *
 * Hanya untuk kode server (route handler / server component). Kunci ini
 * melewati RLS, jadi jangan pernah diimpor dari komponen "use client" dan
 * jangan pernah ikut terkirim ke browser. Kalau kunci belum diisi, dashboard
 * admin tetap jalan dalam mode baca saja.
 */
export const SUPABASE_SECRET = process.env.SUPABASE_SECRET_KEY ?? "";

/** true bila URL + kunci rahasia tersedia → dashboard bisa menulis data. */
export const adminDbEnabled = Boolean(SUPABASE_URL && SUPABASE_SECRET);

/** Klien tulis (kunci rahasia). null bila kunci belum diisi. */
export function createAdminSupabase(): SupabaseClient | null {
  if (!adminDbEnabled) return null;
  return createClient(SUPABASE_URL, SUPABASE_SECRET, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Klien baca untuk server: SELALU memakai kunci publishable.
 *
 * Semua tabel yang dibaca panel admin (categories, products, faqs,
 * site_settings, transactions) punya policy `for select to anon using (true)`,
 * jadi kunci publishable sudah cukup dan hasilnya identik. Keuntungannya:
 * panel admin tetap bisa membaca walau kunci rahasia belum diisi ATAU salah/
 * ditolak Supabase (dulu kunci rahasia yang salah membuat semua endpoint baca
 * balas 502 → "Gagal memuat katalog").
 *
 * Menulis tetap WAJIB kunci rahasia: pakai createAdminSupabase().
 * Kalau suatu saat policy baca itu diperketat (mis. transaksi berbasis
 * auth.uid()), pindahkan baca kembali ke createAdminSupabase().
 */
export function createReadSupabase(): SupabaseClient | null {
  if (!supabaseEnabled) return null;
  return createServerSupabase();
}
