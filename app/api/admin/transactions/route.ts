import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { STATUS_ORDER, type AdminTransaction } from "@/lib/admin-types";
import type { Status } from "@/lib/tx-types";
import { createReadSupabase } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COLUMNS = "id, cat_key, name, target, amount, status, payment_method, token, created_at";

/** GET → daftar transaksi terbaru, bisa difilter status dan dicari. */
export async function GET(req: Request) {
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

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  // Buang karakter yang punya arti khusus di filter PostgREST.
  const q = (url.searchParams.get("q") ?? "").replace(/[,()%_*]/g, "").trim().slice(0, 60);

  let query = sb.from("transactions").select(COLUMNS).order("created_at", { ascending: false }).limit(100);

  if (status && STATUS_ORDER.includes(status as Status)) query = query.eq("status", status);
  if (q) query = query.or(`id.ilike.%${q}%,target.ilike.%${q}%,name.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 502 });

  return NextResponse.json({ transactions: (data ?? []) as AdminTransaction[] });
}
