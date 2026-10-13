import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { STATUS_ORDER, type AdminTransaction } from "@/lib/admin-types";
import type { Status } from "@/lib/tx-types";
import { createAdminSupabase } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH { status } → perbarui status transaksi. */
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
  const body = (await req.json().catch(() => null)) as { status?: string } | null;
  const status = String(body?.status ?? "");

  if (!STATUS_ORDER.includes(status as Status)) {
    return NextResponse.json({ error: "Status tidak dikenal." }, { status: 400 });
  }

  const { data, error } = await sb
    .from("transactions")
    .update({ status })
    .eq("id", id)
    .select("id, cat_key, name, target, amount, status, payment_method, token, created_at")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 502 });
  if (!data) return NextResponse.json({ error: "Transaksi tidak ditemukan." }, { status: 404 });

  return NextResponse.json({ ok: true, transaction: data as AdminTransaction });
}
