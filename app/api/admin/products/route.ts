import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { categoryExists, cleanProduct } from "@/lib/admin-products";
import type { AdminCategory, AdminProduct } from "@/lib/admin-types";
import { revalidate } from "@/lib/db";
import { createAdminSupabase, createReadSupabase } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET → katalog lengkap (kategori + produk) untuk panel admin. */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Tidak diizinkan. Masuk dulu." }, { status: 401 });
  }

  const sb = createReadSupabase();
  if (!sb) {
    return NextResponse.json(
      { error: "Supabase belum dikonfigurasi (isi kunci lewat Secrets)." },
      { status: 503 },
    );
  }

  const [{ data: categories, error: e1 }, { data: products, error: e2 }] = await Promise.all([
    sb.from("categories").select("*").order("sort", { ascending: true }),
    sb.from("products").select("*").order("sort", { ascending: true }),
  ]);

  if (e1 || e2) {
    return NextResponse.json(
      { error: (e1 ?? e2)?.message || "Gagal membaca katalog dari Supabase." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    categories: (categories ?? []) as AdminCategory[],
    products: (products ?? []) as AdminProduct[],
  });
}

/** POST → tambah produk baru ke kategori yang ada. */
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Tidak diizinkan. Masuk dulu." }, { status: 401 });
  }

  const sb = createAdminSupabase();
  if (!sb) {
    return NextResponse.json(
      { error: "Kunci rahasia server (SUPABASE_SECRET_KEY) belum diisi." },
      { status: 503 },
    );
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });

  const cleaned = cleanProduct(body, false);
  if (!cleaned.ok) return NextResponse.json({ error: cleaned.error }, { status: 400 });

  const { data: cats, error: catError } = await sb.from("categories").select("key");
  if (catError) return NextResponse.json({ error: catError.message }, { status: 502 });
  const keys = ((cats ?? []) as { key: string }[]).map((c) => c.key);
  if (!categoryExists(keys, String(cleaned.value.cat_key))) {
    return NextResponse.json({ error: "Kategori tidak ditemukan." }, { status: 400 });
  }

  // Urutan: taruh di akhir kategori.
  const { data: last } = await sb
    .from("products")
    .select("sort")
    .eq("cat_key", cleaned.value.cat_key)
    .order("sort", { ascending: false })
    .limit(1);
  const nextSort = ((last ?? []) as { sort: number }[])[0]?.sort ?? -1;

  const { data, error } = await sb
    .from("products")
    .insert({ ...cleaned.value, sort: nextSort + 1 })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 502 });

  revalidate(); // katalog di situs langsung ikut berubah
  return NextResponse.json({ ok: true, product: data as AdminProduct });
}
