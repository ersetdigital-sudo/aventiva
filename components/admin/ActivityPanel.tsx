"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/lib/icons";
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
    { label: "Total transaksi", value: stats ? String(stats.total) : "—", icon: "receipt", hi: false },
    { label: "Nilai berhasil", value: stats ? rp(stats.revenue) : "—", icon: "wallet", hi: true },
    { label: "Hari ini", value: stats ? String(stats.today) : "—", icon: "clock", hi: false },
    { label: "7 hari terakhir", value: stats ? String(stats.last7) : "—", icon: "check", hi: false },
  ];

  return (
    <>
      {overview && !overview.canWrite && (
        <p className="adm-note adm-note--warn">
          <Icon name="alert" width={18} height={18} />
          <span>
            Kunci rahasia server (<b>SUPABASE_SECRET_KEY</b>) belum diisi, jadi perubahan status belum
            bisa disimpan. Tambahkan kunci itu lewat menu Secrets untuk mengaktifkan.
          </span>
        </p>
      )}

      <section className="adm-stats" aria-label="Ringkasan transaksi">
        {cards.map((c) => (
          <article key={c.label} className={`adm-stat${c.hi ? " adm-stat--hi" : ""}`}>
            <i>
              <Icon name={c.icon} width={18} height={18} />
            </i>
            <b>{c.value}</b>
            <span>{c.label}</span>
          </article>
        ))}
      </section>

      <section className="adm-card">
        <div className="adm-card-head">
          <div>
            <h2>Daftar transaksi</h2>
            <p className="adm-hint">Terbaru di atas (maks. 100 baris). Status bisa diubah langsung dari barisnya.</p>
          </div>
          <span className="adm-badge">{txs === null ? "Memuat…" : `${txs.length} baris`}</span>
        </div>

        <form
          className="adm-tools"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(search.trim());
          }}
        >
          <div className="adm-search">
            <Icon name="search" width={16} height={16} />
            <input
              className="adm-inp"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari ID / nomor tujuan"
              aria-label="Cari transaksi"
            />
          </div>
          <button type="submit" className="adm-btn adm-btn--primary">
            Cari
          </button>
          {query && (
            <button
              type="button"
              className="adm-btn"
              onClick={() => {
                setSearch("");
                setQuery("");
              }}
            >
              Reset
            </button>
          )}
        </form>

        <div className="adm-chips">
          <button type="button" className="adm-chip" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
            Semua
          </button>
          {STATUS_ORDER.map((s) => (
            <button key={s} type="button" className="adm-chip" aria-pressed={filter === s} onClick={() => setFilter(s)}>
              {STATUS_LABEL[s]}
              {stats ? ` · ${stats.byStatus[s]}` : ""}
            </button>
          ))}
        </div>

        {error && (
          <p className="adm-note adm-note--err" style={{ marginTop: 12 }}>
            <Icon name="alert" width={16} height={16} />
            <span>{error}</span>
          </p>
        )}

        <div className="adm-tbl">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Produk</th>
                <th>Tujuan</th>
                <th>Nominal</th>
                <th>Waktu</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {txs === null ? (
                <tr>
                  <td className="adm-empty" colSpan={6}>
                    Memuat…
                  </td>
                </tr>
              ) : txs.length === 0 ? (
                <tr>
                  <td className="adm-empty" colSpan={6}>
                    Tidak ada transaksi pada filter ini.
                  </td>
                </tr>
              ) : (
                txs.map((t) => (
                  <tr key={t.id}>
                    <td data-label="ID">
                      <span className="adm-mono">{t.id}</span>
                    </td>
                    <td data-label="Produk">
                      <span className="adm-strong">{t.name}</span>
                      {t.payment_method ? <span className="adm-muted"> · {t.payment_method}</span> : null}
                    </td>
                    <td data-label="Tujuan">{t.target}</td>
                    <td data-label="Nominal" className="nowrap">
                      <span className="adm-strong">{rp(t.amount)}</span>
                    </td>
                    <td data-label="Waktu" className="nowrap">
                      <span className="adm-muted">{fmtDate(Date.parse(t.created_at))}</span>
                    </td>
                    <td data-label="Status" className="adm-td-act">
                      <div className="adm-status">
                        <span className={`st ${STATUS_CLASS[t.status]}`}>{STATUS_LABEL[t.status]}</span>
                        <select
                          className="adm-sel adm-sel--sm"
                          style={{ width: 132 }}
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
    </>
  );
}
