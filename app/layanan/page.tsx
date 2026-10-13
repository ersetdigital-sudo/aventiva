import type { Metadata } from "next";
import { Suspense } from "react";
import { LayananView } from "@/components/LayananView";

export const metadata: Metadata = {
  title: "Semua Produk",
  description:
    "Katalog lengkap pulsa, paket data, token PLN, top up e-wallet, internet, BPJS, PDAM, dan angsuran multifinance. Harga dan biaya admin transparan.",
  alternates: { canonical: "/layanan" },
};

export default function LayananPage() {
  return (
    <main id="main" className="wrap pb-5">
      <Suspense fallback={null}>
        <LayananView />
      </Suspense>
    </main>
  );
}
