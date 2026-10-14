import { CATS, type Category, type ProductItem } from "@/data/categories";
import type { Faq } from "@/data/faq";
import { SITE } from "@/data/site";
import { getSupabase, supabaseEnabled } from "./supabase";
import type { Tx } from "./tx-types";

/* ------------------------------------------------------------------ *
 * Util: cache singkat di memori server supaya tiap request tidak
 * memukul Supabase berulang. TTL 30 detik — cukup untuk dev/preview.
 * ------------------------------------------------------------------ */
type Entry = { key: string; exp: number; value: unknown };
const CACHE: Entry[] = [];
const TTL = 30_000;

async function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const idx = CACHE.findIndex((c) => c.key === key);
  if (idx >= 0 && CACHE[idx].exp > now) return CACHE[idx].value as T;
  const value = await fn();
  const entry: Entry = { key, value, exp: now + TTL };
  if (idx >= 0) CACHE[idx] = entry;
  else CACHE.push(entry);
  return value;
}

/** Hapus cache (dipakai setelah sinkronisasi dari /admin). */
export function revalidate() {
  CACHE.length = 0;
}

/* ------------------------------------------------------------------ *
 * Server: katalog produk
 * ------------------------------------------------------------------ */

type CategoryRow = {
  key: string;
  name: string;
  ico: string;
  label: string;
  admin: number;
  filters: string[];
  sort: number;
};

type ProductRow = {
  cat_key: string;
  n: string;
  b: string;
  f: string;
  d: string;
  p: number;
  o: number | null;
  bill: boolean;
  soldout: boolean;
  sort: number;
};

/**
 * Katalog dari Supabase; kalau tabel masih kosong / koneksi gagal →
 * pakai data statis di data/categories.ts (situs tetap jalan).
 */
export async function getCatalog(): Promise<Record<string, Category>> {
  if (!supabaseEnabled) return CATS;
  return cached("catalog", async () => {
    try {
      const sb = getSupabase()!;
      const [{ data: cats, error: e1 }, { data: prods, error: e2 }] = await Promise.all([
        sb.from("categories").select("*").order("sort", { ascending: true }),
        sb.from("products").select("*").order("sort", { ascending: true }),
      ]);
      if (e1 || e2 || !cats?.length || !prods?.length) return CATS;

      const out: Record<string, Category> = {};
      for (const c of cats as CategoryRow[]) {
        out[c.key] = {
          name: c.name,
          ico: c.ico,
          label: c.label,
          admin: c.admin,
          filters: c.filters ?? [],
          items: [],
        };
      }
      for (const p of prods as ProductRow[]) {
        const cat = out[p.cat_key];
        if (!cat) continue;
        const item: ProductItem = {
          n: p.n,
          b: p.b,
          f: p.f,
          d: p.d,
          p: p.p,
          ...(p.o ? { o: p.o } : {}),
          ...(p.bill ? { bill: true } : {}),
          ...(p.soldout ? { soldout: true } : {}),
        };
        cat.items.push(item);
      }
      const usable = Object.values(out).some((c) => c.items.length > 0);
      return usable ? out : CATS;
    } catch {
      return CATS;
    }
  });
}

/* ------------------------------------------------------------------ *
 * Server: FAQ
 * ------------------------------------------------------------------ */

type FaqRow = { cat: string; q: string; a: string; sort: number };

/** FAQ dari Supabase; null bila belum ada isinya. */
export async function getFaqs(): Promise<Faq[] | null> {
  if (!supabaseEnabled) return null;
  return cached("faqs", async () => {
    try {
      const sb = getSupabase()!;
      const { data, error } = await sb.from("faqs").select("*").order("sort", { ascending: true });
      if (error || !data?.length) return null;
      return (data as FaqRow[]).map(({ cat, q, a }) => ({ cat, q, a }));
    } catch {
      return null;
    }
  });
}

/* ------------------------------------------------------------------ *
 * Server: pengaturan situs (key/value)
 * ------------------------------------------------------------------ */

/** Pengaturan dari Supabase; null bila belum ada isinya. */
export async function getSettings(): Promise<Record<string, string> | null> {
  if (!supabaseEnabled) return null;
  return cached("settings", async () => {
    try {
      const sb = getSupabase()!;
      const { data, error } = await sb.from("site_settings").select("key,value");
      if (error || !data?.length) return null;
      const out: Record<string, string> = {};
      for (const r of data as { key: string; value: string }[]) out[r.key] = r.value;
      return out;
    } catch {
      return null;
    }
  });
}

/** Gabungkan pengaturan Supabase di atas SITE statis. */
export function mergeSite(settings: Record<string, string>): typeof SITE {
  const s = settings;
  return {
    ...SITE,
    name: s.name || SITE.name,
    tagline: s.tagline || SITE.tagline,
    url: s.url || SITE.url,
    waNumber: s.wa_number || SITE.waNumber,
    waDisplay: s.wa_display || SITE.waDisplay,
    email: s.email || SITE.email,
    hours: s.hours || SITE.hours,
    hoursNote: s.hours_note || SITE.hoursNote,
    description: s.description || SITE.description,
    social: {
      instagram: s.social_instagram || SITE.social.instagram,
      facebook: s.social_facebook || SITE.social.facebook,
      tiktok: s.social_tiktok || SITE.social.tiktok,
    },
  };
}

/* ------------------------------------------------------------------ *
 * Client: transaksi
 * ------------------------------------------------------------------ */

/** Simpan transaksi ke Supabase. false = gagal / belum dikonfigurasi. */
export async function saveTransaction(tx: Tx): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const { error } = await sb.from("transactions").insert({
      id: tx.id,
      cat_key: tx.k ?? null,
      name: tx.n,
      target: tx.t,
      amount: tx.p,
      status: tx.s,
      payment_method: tx.pm ?? null,
      fee: tx.fee ?? 0,
      token: tx.token ?? null,
      created_at: new Date(tx.d).toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}

/** Cari transaksi: `key` ID (AVD-…) atau nomor tujuan. */
export async function lookupTransaction(key: string, byId: boolean): Promise<Tx | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const query = sb.from("transactions").select("*").limit(1);
    const { data, error } = byId
      ? await query.eq("id", key.toUpperCase())
      : await query.eq("target", key);
    if (error || !data?.length) return null;
    const r = data[0] as {
      id: string;
      name: string;
      target: string;
      amount: number;
      status: Tx["s"];
      payment_method: string | null;
      token: string | null;
      created_at: string;
    };
    return {
      id: r.id,
      n: r.name.replace(" – ", " "),
      t: r.target,
      p: r.amount,
      d: Date.parse(r.created_at),
      s: r.status,
      ...(r.token ? { token: r.token } : {}),
      ...(r.payment_method ? { pm: r.payment_method } : {}),
    };
  } catch {
    return null;
  }
}
