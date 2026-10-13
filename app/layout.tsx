import type { Metadata } from "next";
import { Suspense } from "react";
import { BackToTop } from "@/components/BackToTop";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ShopProvider } from "@/components/ShopProvider";
import { CatalogProvider } from "@/lib/catalog-context";
import { getCatalog, getSettings, mergeSite } from "@/lib/db";
import { SiteProvider } from "@/lib/site-context";
import { SITE } from "@/data/site";
import { jakarta } from "./fonts";
import "./globals.css";

/**
 * Halaman dibuat dynamic per-request supaya useSearchParams (header, filter
 * katalog, cek transaksi, FAQ) ter-render utuh di HTML — bukan blank sampai JS.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Pulsa, Data, Token PLN & Tagihan`,
    template: `%s — ${SITE.name}`,
  },
  description:
    "Beli pulsa, paket data, token PLN, top up e-wallet (GoPay, OVO, DANA, ShopeePay) dan bayar tagihan listrik, air, BPJS. Harga jelas, biaya admin terlihat sebelum bayar.",
  keywords: [
    "pulsa",
    "paket data",
    "token PLN",
    "top up e-wallet",
    "bayar tagihan",
    "BPJS",
    "PDAM",
    "pulsa murah",
    "beli pulsa online",
  ],
  applicationName: SITE.name,
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: SITE.name,
    url: SITE.url,
    title: `${SITE.name} — Pulsa, Data, Token PLN & Tagihan`,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — Pulsa, Data, Token PLN & Tagihan`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE.url}/#organization`,
      name: SITE.name,
      url: SITE.url,
      email: SITE.email,
      description: SITE.description,
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          telephone: `+${SITE.waNumber}`,
          email: SITE.email,
          areaServed: "ID",
          availableLanguage: ["id"],
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: SITE.url,
      name: SITE.name,
      inLanguage: "id",
      publisher: { "@id": `${SITE.url}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE.url}/layanan?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Katalog + pengaturan dari Supabase (fallback otomatis ke data statis)
  const [cats, settings] = await Promise.all([getCatalog(), getSettings()]);
  const site = settings ? mergeSite(settings) : SITE;

  return (
    <html lang="id">
      <body className={jakarta.variable}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-[color:var(--brand)]"
        >
          Lompat ke konten utama
        </a>
        <SiteProvider site={site}>
          <CatalogProvider cats={cats}>
            <ShopProvider>
              <Suspense fallback={null}>
                <Header />
              </Suspense>
              {children}
              <Footer />
              <BackToTop />
            </ShopProvider>
          </CatalogProvider>
        </SiteProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      </body>
    </html>
  );
}
