import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { cleanPayment } from "@/lib/payment-methods";
import type { PaymentMethod } from "@/lib/payment-types";
import { createAdminSupabase } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COLUMNS =
  "id, code, name, grp, descr, fee_type, fee_value, account_no, account_name, instructions, logo, active, sort";

/** GET → semua metode (termasuk nonaktif) untuk panel admin. */
export async function GET() {
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

  const { data, error } = await sb
    .from("payment_methods")
    .select(COLUMNS)
    .order("grp", { ascending: true })
    .order("sort", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: error.message || "Tabel payment_methods belum dibuat — jalankan supabase/payment_methods.sql." },
      { status: 502 },
    );
  }

  return NextResponse.json({ methods: (data ?? []) as PaymentMethod[] });
}

/** POST → tambah metode baru (selalu tanpa kode khusus). */
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

  const cleaned = cleanPayment(body, null);
  if (!cleaned.ok) return NextResponse.json({ error: cleaned.error }, { status: 400 });

  // taruh di urutan terakhir dalam grupnya
  const { data: last } = await sb
    .from("payment_methods")
    .select("sort")
    .eq("grp", cleaned.value.grp)
    .order("sort", { ascending: false })
    .limit(1);
  const nextSort = ((last ?? []) as { sort: number }[])[0]?.sort ?? -1;

  const { data, error } = await sb
    .from("payment_methods")
    .insert({ ...cleaned.value, sort: nextSort + 1 })
    .select(COLUMNS)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 502 });

  return NextResponse.json({ ok: true, method: data as PaymentMethod });
}
