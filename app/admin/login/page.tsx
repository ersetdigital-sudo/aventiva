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
    <main id="main" className="wrap py-10">
      <AdminLogin />
    </main>
  );
}
