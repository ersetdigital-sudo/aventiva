"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/lib/icons";
import { ActivityPanel } from "./ActivityPanel";
import { ProductsPanel } from "./ProductsPanel";
import { QrisPanel } from "./QrisPanel";

const TABS = [
  { id: "aktivitas", label: "Transaksi & Aktivitas", icon: "receipt" },
  { id: "produk", label: "Produk & Harga", icon: "tag" },
  { id: "qris", label: "QRIS", icon: "wallet" },
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
    <div className="adm">
      <header className="adm-head">
        <div className="adm-head-main">
          <span className="adm-kick">
            <Icon name="lock" width={13} height={13} />
            Panel internal
          </span>
          <h1>Panel Admin</h1>
          <p>Kelola katalog, harga, dan pantau aktivitas transaksi dari satu tempat.</p>
        </div>
        <button type="button" className="adm-out" onClick={logout}>
          <Icon name="x" width={16} height={16} />
          Keluar
        </button>
      </header>

      <nav className="adm-tabs" aria-label="Menu panel admin">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className="adm-tab"
            aria-pressed={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            <Icon name={t.icon} width={16} height={16} />
            {t.label}
          </button>
        ))}
      </nav>

      <div className="adm-body">
        {tab === "aktivitas" && <ActivityPanel />}
        {tab === "produk" && <ProductsPanel />}
        {tab === "qris" && <QrisPanel />}
      </div>
    </div>
  );
}
