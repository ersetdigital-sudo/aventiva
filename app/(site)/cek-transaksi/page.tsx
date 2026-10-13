import type { Metadata } from "next";
import { Suspense } from "react";
import { CekTransaksiView } from "@/components/CekTransaksiView";

export const metadata: Metadata = {
  title: "Cek Status Transaksi",
  description:
    "Cek status pesanan pulsa, paket data, token PLN, dan pembayaran tagihan menggunakan ID transaksi atau nomor tujuan. Tanpa login.",
  alternates: { canonical: "/cek-transaksi" },
};

export default function CekTransaksiPage() {
  return (
    <main id="main" className="wrap sp pb-5">
      <Suspense fallback={null}>
        <CekTransaksiView />
      </Suspense>
    </main>
  );
}
