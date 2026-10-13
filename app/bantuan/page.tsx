import type { Metadata } from "next";
import { Suspense } from "react";
import { HelpCenter } from "@/components/HelpCenter";
import { FAQ } from "@/data/faq";
import { getFaqs } from "@/lib/db";

export const metadata: Metadata = {
  title: "Pusat Bantuan",
  description:
    "Pertanyaan seputar cara transaksi, metode pembayaran, biaya admin, refund, dan masalah pulsa/token yang belum masuk. Plus kontak CS WhatsApp & email.",
  alternates: { canonical: "/bantuan" },
};

export default async function BantuanPage() {
  // FAQ dari Supabase; bila tabel masih kosong → pakai data statis
  const faqs = (await getFaqs()) ?? FAQ;

  const FAQ_LD = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a.replace(/<[^>]+>/g, "") },
    })),
  };

  return (
    <main id="main" className="wrap sp pb-5">
      <Suspense fallback={null}>
        <HelpCenter faqs={faqs} />
      </Suspense>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_LD) }} />
    </main>
  );
}
