import type { Metadata } from "next";
import { AdminPanel } from "@/components/AdminPanel";

export const metadata: Metadata = {
  title: "Panel Admin",
  description: "Panel internal: upload gambar QRIS dan status koneksi Supabase.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <main id="main" className="wrap pb-5">
      <AdminPanel />
    </main>
  );
}
