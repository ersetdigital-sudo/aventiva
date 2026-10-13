import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { cleanProduct } from "@/lib/admin-products";
import type { AdminProduct } from "@/lib/admin-types";
import { revalidate } from "@/lib/db";
import { createAdminSupabase } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH → perbarui sebagian field produk (harga, nama, stok, dst). */
export async function PATCH(req: Request, { params }: Ctx) {
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

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) {
    return NextResponse.json({ error: "ID produk tidak valid." }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });

  const cleaned = cleanProduct(body, true);
  if (!cleaned.ok) return NextResponse.json({ error: cleaned.error }, { status: 400 });
  if (Object.keys(cleaned.value).length === 0) {
    return NextResponse.json({ error: "Tidak ada field yang diubah." }, { status: 400 });
  }

  const { data, error } = await sb
    .from("products")
    .update(cleaned.value)
    .eq("id", productId)
    .select("*")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 502 });
  if (!data) return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });

  revalidate();
  return NextResponse.json({ ok: true, product: data as AdminProduct });
}

/** DELETE → hapus produk. */
export async function DELETE(_req: Request, { params }: Ctx) {
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

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) {
    return NextResponse.json({ error: "ID produk tidak valid." }, { status: 400 });
  }

  const { error } = await sb.from("products").delete().eq("id", productId);
  if (error) return NextResponse.json({ error: error.message }, { status: 502 });

  revalidate();
  return NextResponse.json({ ok: true });
}
