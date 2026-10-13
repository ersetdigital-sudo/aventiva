import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Sesi panel admin — satu kata sandi (ADMIN_KEY), tanpa tabel user.
 *
 * Token sesi = HMAC-SHA256 dari string tetap memakai ADMIN_KEY sebagai kunci.
 * Sifatnya stateless: tidak perlu penyimpanan sesi, dan mengganti ADMIN_KEY
 * otomatis membatalkan semua sesi lama. Cookie-nya httpOnly, jadi nilainya
 * tidak pernah bisa dibaca JavaScript di browser.
 */

export const ADMIN_COOKIE = "avd_admin";
/** Umur sesi: 8 jam. */
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

/** ADMIN_KEY boleh dibaca di server; tidak pernah dikirim ke browser. */
function adminKey(): string {
  return process.env.ADMIN_KEY ?? "";
}

/** Apakah panel admin bisa dipakai (ADMIN_KEY terisi). */
export function adminAuthEnabled(): boolean {
  return adminKey().length > 0;
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** Token sesi yang valid untuk ADMIN_KEY saat ini (null bila belum di-set). */
export function sessionToken(): string | null {
  const key = adminKey();
  if (!key) return null;
  return createHmac("sha256", key).update("aventiva-admin-session-v1").digest("hex");
}

/** Cocokkan kata sandi yang dikirim form dengan ADMIN_KEY. */
export function verifyPassword(input: string): boolean {
  const key = adminKey();
  if (!key || !input) return false;
  return safeEqual(input, key);
}

/** Sudah login? Dipakai di server component dan route handler. */
export async function isAdmin(): Promise<boolean> {
  const token = sessionToken();
  if (!token) return false;
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!value) return false;
  return safeEqual(value, token);
}
