import { Suspense } from "react";
import { BackToTop } from "@/components/BackToTop";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ShopProvider } from "@/components/ShopProvider";
import { CatalogProvider } from "@/lib/catalog-context";
import { getCatalog, getSettings, mergeSite } from "@/lib/db";
import { SiteProvider } from "@/lib/site-context";
import { SITE } from "@/data/site";

/**
 * Layout halaman publik: header toko, footer, dan provider data situs.
 *
 * Halaman /admin berada DI LUAR grup ini, jadi panel admin tampil bersih
 * tanpa navbar & footer toko (root layout hanya menyediakan <html>/<body>).
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Katalog + pengaturan dari Supabase (fallback otomatis ke data statis)
  const [cats, settings] = await Promise.all([getCatalog(), getSettings()]);
  const site = settings ? mergeSite(settings) : SITE;

  return (
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
  );
}
