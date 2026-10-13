"use client";

import { useCallback, useEffect, useState } from "react";
import { STATUS_CLASS, STATUS_LABEL, STATUS_ORDER, type AdminOverview, type AdminTransaction } from "@/lib/admin-types";
import { fmtDate, rp } from "@/lib/format";
import type { Status } from "@/lib/tx-types";

type Filter = Status | "all";

/** Tab aktivitas: ringkasan angka, pencarian, dan daftar transaksi. */
export function ActivityPanel() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [txs, setTxs] = useState<AdminTransaction[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadOverview = useCallback(async () => {
    const res = await fetch("/api/admin/overview");
    if (res.ok) setOverview((await res.json()) as AdminOverview);
  }, []);

  const loadTxs = useCallback(async () => {
    const params = new URLSearchParams();
    if (filter !== "all") params.set("status", filter);
    if (query) params.set("q", query);
    const res = await fetch(`/api/admin/transactions?${params.toString()}`);
    const data = (await res.json().catch(() => null)) as { transactions?: AdminTransaction[]; error?: string } | null;
    if (res.ok && data?.transactions) {
      setTxs(data.transactions);
      setError("");
    } else {
      setTxs([]);
      setError(data?.error ?? "Gagal memuat daftar transaksi.");
    }
  }, [filter, query]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    void loadTxs();
  }, [loadTxs]);

  async function updateStatus(id: string, next: Status) {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/transactions/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setError(data?.error ?? "Gagal memperbarui status.");
        return;
      }
      await Promise.all([loadTxs(), loadOverview()]);
    } finally {
      setBusyId(null);
    }
  }

  const stats = overview?.stats ?? null;
  const cards = [
    { label: "Total transaksi", value: stats ? String(stats.total) : "—" },
    { label: "Nilai berhasil", value: stats ? rp(stats.revenue) : "—" },
    { label: "Hari ini", value: stats ? String(stats.today) : "—" },
    { label: "7 hari terakhir", value: stats ? String(stats.last7) : "—" },
  ];

  return (
    <div className="space-y-5">
      {overview && !overview.canWrite && (
        <p className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Kunci rahasia server (<b>SUPABASE_SECRET_KEY</b>) belum diisi, jadi perubahan status
          belum bisa disimpan. Tambahkan kunci itu lewat menu Secrets untuk mengaktifkan.
        </p>
      )}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium text-slate-500">{c.label}</p>
            <p className="mt-1 text-xl font-extrabold text-slate-900">{c.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="mr-auto font-bold text-slate-900">Daftar transaksi</h2>
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(search.trim());
            }}
          >
            <input
              className="inp !mt-0 w-[200px] !py-2 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari ID / nomor tujuan"
              aria-label="Cari transaksi"
            />
            <button type="submit" className="chip font-medium">
              Cari
            </button>
            {query && (
              <button
                type="button"
                className="chip font-medium"
                onClick={() => {
                  setSearch("");
                  setQuery("");
                }}
              >
                Reset
              </button>
            )}
          </form>
        </div>

        <div className="noscroll mt-4 flex gap-2 overflow-x-auto pb-1">
          <button type="button" className="chip" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
            Semua
          </button>
          {STATUS_ORDER.map((s) => (
            <button key={s} type="button" className="chip" aria-pressed={filter === s} onClick={() => setFilter(s)}>
              {STATUS_LABEL[s]}
              {stats ? ` · ${stats.byStatus[s]}` : ""}
            </button>
          ))}
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-3 font-semibold">ID</th>
                <th className="py-2 pr-3 font-semibold">Produk</th>
                <th className="py-2 pr-3 font-semibold">Tujuan</th>
                <th className="py-2 pr-3 font-semibold">Nominal</th>
                <th className="py-2 pr-3 font-semibold">Waktu</th>
                <th className="py-2 pr-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {txs === null ? (
                <tr>
                  <td className="py-3 text-slate-500" colSpan={6}>
                    Memuat…
                  </td>
                </tr>
              ) : txs.length === 0 ? (
                <tr>
                  <td className="py-3 text-slate-500" colSpan={6}>
                    Tidak ada transaksi pada filter ini.
                  </td>
                </tr>
              ) : (
                txs.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-3 font-mono text-xs text-slate-700">{t.id}</td>
                    <td className="py-3 pr-3">
                      <span className="font-medium text-slate-800">{t.name}</span>
                      {t.payment_method ? (
                        <span className="ml-2 text-xs text-slate-500">· {t.payment_method}</span>
                      ) : null}
                    </td>
                    <td className="py-3 pr-3 text-slate-700">{t.target}</td>
                    <td className="py-3 pr-3 whitespace-nowrap text-slate-700">{rp(t.amount)}</td>
                    <td className="py-3 pr-3 whitespace-nowrap text-xs text-slate-500">
                      {fmtDate(Date.parse(t.created_at))}
                    </td>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <span className={`st ${STATUS_CLASS[t.status]} whitespace-nowrap`}>
                          {STATUS_LABEL[t.status]}
                        </span>
                        <select
                          className="inp !mt-0 !w-[132px] !py-1 text-xs"
                          value={t.status}
                          disabled={busyId === t.id || (overview ? !overview.canWrite : false)}
                          aria-label={`Ubah status ${t.id}`}
                          onChange={(e) => void updateStatus(t.id, e.target.value as Status)}
                        >
                          {STATUS_ORDER.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABEL[s]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
