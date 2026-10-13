import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import type { Status } from "@/lib/tx-types";
import { STATUS_ORDER, type TableCount } from "@/lib/admin-types";
import { adminDbEnabled, createReadSupabase } from "@/lib/supabase-admin";
import { supabaseEnabled } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TABLES = ["categories", "products", "faqs", "site_settings", "transactions"];

const emptyByStatus = () =>
  STATUS_ORDER.reduce((acc, s) => ({ ...acc, [s]: 0 }), {} as Record<Status, number>);

/** Ringkasan untuk dashboard: jumlah baris per tabel + statistik transaksi. */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Tidak diizinkan. Masuk dulu." }, { status: 401 });
  }

  const sb = createReadSupabase();
  const base = { canWrite: adminDbEnabled, storefrontDb: supabaseEnabled };

  if (!sb) {
    return NextResponse.json({ ...base, counts: [], stats: null });
  }

  // Jumlah baris per tabel (head request, tidak menarik datanya).
  const counts: TableCount[] = [];
  for (const table of TABLES) {
    const { count, error } = await sb.from(table).select("*", { count: "exact", head: true });
    counts.push({
      table,
      n: error ? null : (count ?? 0),
      err: error ? error.message || "ditolak — tabel belum dibuat / belum di-grant" : null,
    });
  }

  // Statistik transaksi. Volume masih kecil (ratusan), jadi dihitung di sini.
  const { data, error } = await sb.from("transactions").select("status, amount, created_at");
  let stats = null;
  if (!error && data) {
    const byStatus = emptyByStatus();
    let revenue = 0;
    let today = 0;
    let last7 = 0;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    for (const row of data as { status: Status; amount: number | null; created_at: string }[]) {
      const status = row.status;
      if (status in byStatus) byStatus[status] += 1;
      const at = Date.parse(row.created_at);
      const amount = row.amount ?? 0;
      if (status === "success") revenue += amount;
      if (at >= startOfDay.getTime()) today += 1;
      if (at >= weekAgo) last7 += 1;
    }

    stats = { total: data.length, byStatus, revenue, today, last7 };
  }

  return NextResponse.json({ ...base, counts, stats });
}
