"use client";
import { createContext, useContext } from "react";

export type PendingBuy = { cat: string; idx: number };

type ShopCtx = {
  pending: PendingBuy | null;
  open: (cat: string, idx: number) => void;
  close: () => void;
};

export const ShopContext = createContext<ShopCtx | null>(null);

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop harus dipakai di dalam <ShopProvider>");
  return ctx;
}
