"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ActivityPanel } from "./ActivityPanel";
import { ProductsPanel } from "./ProductsPanel";
import { QrisPanel } from "./QrisPanel";

const TABS = [
  { id: "aktivitas", label: "Transaksi & Aktivitas" },
  { id: "produk", label: "Produk & Harga" },
  { id: "qris", label: "QRIS & Sistem" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/** Shell panel admin: header, tab, dan tombol keluar. */
export function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("aktivitas");

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Panel Admin</h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola katalog, harga, dan pantau aktivitas transaksi.
          </p>
        </div>
        <button type="button" className="chip font-medium" onClick={logout}>
          Keluar
        </button>
      </div>

      <div className="noscroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className="chip font-medium"
            aria-pressed={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "aktivitas" && <ActivityPanel />}
      {tab === "produk" && <ProductsPanel />}
      {tab === "qris" && <QrisPanel />}
    </div>
  );
}
