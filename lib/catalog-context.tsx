"use client";
import { createContext, useContext, type ReactNode } from "react";
import { CATS, type Category } from "@/data/categories";

/**
 * Katalog dari Supabase (diisi layout server) dengan fallback data statis.
 * Semua komponen belanja membaca dari sini supaya indeks produk yang dibuka
 * dialog beli selalu sama dengan yang tampil di grid.
 */
const CatalogContext = createContext<Record<string, Category>>(CATS);

export function CatalogProvider({
  cats,
  children,
}: {
  cats: Record<string, Category>;
  children: ReactNode;
}) {
  return <CatalogContext.Provider value={cats}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): Record<string, Category> {
  return useContext(CatalogContext);
}
