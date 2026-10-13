import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLogin } from "@/components/AdminLogin";
import { isAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Masuk Panel Admin",
  description: "Masuk ke panel admin Aventiva Digital.",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // Sudah punya sesi? langsung ke dashboard.
  if (await isAdmin()) redirect("/admin");

  return (
    <main
      id="main"
      className="grid place-items-center px-4 py-10 sm:px-6"
      // Halaman ini tampil tanpa header/footer toko (lihat app/layout.tsx),
      // jadi latarnya dibuat penuh satu layar dengan warna brand.
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(160deg,#1B1B4B 0%,#312E81 60%,#4338CA 100%)",
      }}
    >
      <AdminLogin />
    </main>
  );
}
