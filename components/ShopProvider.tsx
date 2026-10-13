"use client";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ShopContext, type PendingBuy } from "@/lib/shop-context";
import { BuyDialog } from "./BuyDialog";

/** Menyediakan state "produk yang sedang dibeli" untuk seluruh aplikasi. */
export function ShopProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingBuy | null>(null);
  const pathname = usePathname();

  // tutup dialog bila pengguna pindah halaman (mis. klik "Cek Status")
  useEffect(() => {
    setPending(null);
  }, [pathname]);

  const value = useMemo(
    () => ({
      pending,
      open: (cat: string, idx: number) => setPending({ cat, idx }),
      close: () => setPending(null),
    }),
    [pending],
  );

  return (
    <ShopContext.Provider value={value}>
      {children}
      <BuyDialog />
    </ShopContext.Provider>
  );
}
