import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { isAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Panel Admin",
  description: "Kelola produk, harga, transaksi, dan QRIS.",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  // Belum login? lempar ke halaman masuk.
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <main id="main" className="wrap py-6 md:py-8">
      <AdminDashboard />
    </main>
  );
}
