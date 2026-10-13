"use client";
import { createContext, useContext, type ReactNode } from "react";
import { SITE } from "@/data/site";

/**
 * Pengaturan situs (WA, email, jam CS, sosial) dari Supabase,
 * dengan fallback penuh ke data statis di data/site.ts.
 */
const SiteContext = createContext<typeof SITE>(SITE);

export function SiteProvider({
  site,
  children,
}: {
  site: typeof SITE;
  children: ReactNode;
}) {
  return <SiteContext.Provider value={site}>{children}</SiteContext.Provider>;
}

export function useSite(): typeof SITE {
  return useContext(SiteContext);
}
