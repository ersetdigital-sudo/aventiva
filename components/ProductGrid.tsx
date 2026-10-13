"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { type ProductItem } from "@/data/categories";
import { useCatalog } from "@/lib/catalog-context";
import { ProductCard, ProductSkeleton } from "./ProductCard";

const TABS = ["pulsa", "data", "pln", "ewallet"];

/** Ambil maksimal 10 produk terpencar rata (sama dengan versi HTML statis). */
function pick(items: ProductItem[]): [ProductItem, number][] {
  const arr = items.map((x, i) => [x, i] as [ProductItem, number]);
  const step = Math.max(1, Math.floor(arr.length / 10));
  return arr.filter((_, j) => j % step === 0).slice(0, 10);
}

/** Grid produk ber-tab + skeleton di halaman beranda. */
export function ProductGrid() {
  const CATS = useCatalog();
  const [tab, setTab] = useState(TABS[0]);
  const [loading, setLoading] = useState(false);

  // pakai tab yang benar-benar tersedia (aman bila katalog DB berbeda)
  const tabs = useMemo(
    () => (TABS.some((k) => CATS[k]?.items.length) ? TABS.filter((k) => CATS[k]?.items.length) : Object.keys(CATS).slice(0, 4)),
    [CATS],
  );
  const active = CATS[tab]?.items.length ? tab : tabs[0];

  const firstRender = useRef(true);

  useEffect(() => {
    // jangan tampilkan skeleton saat pertama kali render
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 320);
    return () => clearTimeout(t);
  }, [tab]);

  const items = useMemo(() => pick(CATS[active]?.items ?? []), [CATS, active]);

  return (
    <>
      <div className="flex gap-2 overflow-x-auto noscroll mb-6" role="tablist">
        {tabs.map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            className="tab-pill"
            aria-selected={k === active}
            onClick={() => setTab(k)}
          >
            {CATS[k].name}
          </button>
        ))}
      </div>
      <div className="pc-grid" aria-live="polite">
        {loading
          ? Array.from({ length: 10 }, (_, i) => <ProductSkeleton key={i} />)
          : items.map(([x, i]) => (
              <ProductCard key={`${active}-${i}`} catKey={active} idx={i} item={x} />
            ))}
      </div>
    </>
  );
}
