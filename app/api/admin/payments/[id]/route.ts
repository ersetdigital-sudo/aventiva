import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { cleanPayment } from "@/lib/payment-methods";
import { QRIS_CODE, type PaymentMethod } from "@/lib/payment-types";
import { createAdminSupabase } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const COLUMNS =
  "id, code, name, grp, descr, fee_type, fee_value, account_no, account_name, instructions, logo, active, sort";

/** PATCH → perbarui satu metode (menerima sebagian field). */
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

  const id = Number((await params).id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });

  const { data: current, error: getErr } = await sb
    .from("payment_methods")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (getErr) return NextResponse.json({ error: getErr.message }, { status: 502 });
  if (!current) return NextResponse.json({ error: "Metode tidak ditemukan." }, { status: 404 });

  // gabungkan baris lama dengan perubahan, lalu validasi sebagai objek utuh
  const merged = { ...(current as Record<string, unknown>), ...body };
  const cleaned = cleanPayment(merged, (current as PaymentMethod).code);
  if (!cleaned.ok) return NextResponse.json({ error: cleaned.error }, { status: 400 });

  const { data, error } = await sb
    .from("payment_methods")
    .update({ ...cleaned.value, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(COLUMNS)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 502 });

  return NextResponse.json({ ok: true, method: data as PaymentMethod });
}

/** DELETE → hapus metode. Baris QRIS tidak boleh dihapus. */
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

  const id = Number((await params).id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
  }

  const { data: current } = await sb.from("payment_methods").select("code").eq("id", id).maybeSingle();
  if (current && (current as { code: string | null }).code === QRIS_CODE) {
    return NextResponse.json(
      { error: "QRIS tidak bisa dihapus. Nonaktifkan saja bila tidak dipakai." },
      { status: 400 },
    );
  }

  const { error } = await sb.from("payment_methods").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 502 });

  return NextResponse.json({ ok: true });
}
