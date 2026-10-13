"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { categoryByQuery, type ProductItem } from "@/data/categories";
import { useCatalog } from "@/lib/catalog-context";
import { Icon } from "@/lib/icons";

/** Halaman katalog: sidebar kategori, filter, urutkan, pencarian (dari header). */
export function LayananView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [flt, setFlt] = useState("Semua");
  const [sort, setSort] = useState("");
  const CATS = useCatalog();

  const q = (params.get("q") ?? "").toLowerCase();
  const catParam = params.get("c");
  const auto = !catParam && q ? categoryByQuery(q, CATS) : null;
  const fallback = CATS.pulsa ? "pulsa" : Object.keys(CATS)[0];
  const cur =
    catParam && CATS[catParam] ? catParam : auto && CATS[auto] ? auto : fallback;
  const cat = CATS[cur] ?? CATS[fallback];

  let list: [ProductItem, number][] = cat.items
    .map((x, i) => [x, i] as [ProductItem, number])
    .filter(([x]) => (flt === "Semua" || x.f === flt) && `${x.n} ${x.b} ${x.d}`.toLowerCase().includes(q));
  if (sort) list = [...list].sort((a, b) => (sort === "lo" ? a[0].p - b[0].p : b[0].p - a[0].p));

  function pickCat(k: string) {
    setFlt("Semua");
    const p = new URLSearchParams(params.toString());
    p.set("c", k);
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  }

  return (
    <>
      <div className="text-sm text-slate-500 mb-3">
        <Link href="/">Beranda</Link> / <span>{cat.name}</span>
      </div>

      {/* kategori mobile */}
      <div className="md:hidden flex gap-2 overflow-x-auto noscroll mb-4">
        {Object.entries(CATS).map(([k, x]) => (
          <button key={k} type="button" className="chip" aria-pressed={k === cur} onClick={() => pickCat(k)}>
            {x.name}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-[220px_1fr] gap-5">
        <aside className="hidden md:block">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 sticky top-24">
            <div className="font-bold px-2 py-2">Kategori</div>
            <div className="flex flex-col">
              {Object.entries(CATS).map(([k, x]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => pickCat(k)}
                  className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                    k === cur ? "bg-[color:var(--soft)] text-indigo-800" : "hover:bg-slate-50"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon name={x.ico} className="w-5 h-5" />
                    {x.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 flex flex-col md:flex-row md:items-center gap-3 justify-between">
            <h1 className="text-2xl font-extrabold">{cat.name}</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">Urutkan</span>
              <select
                className="border border-slate-300 rounded-lg px-2 py-1.5"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="">Relevan</option>
                <option value="lo">Harga terendah</option>
                <option value="hi">Harga tertinggi</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto noscroll mb-4">
            {["Semua", ...cat.filters].map((f) => (
              <button
                key={f}
                type="button"
                className="chip"
                aria-pressed={f === flt}
                onClick={() => setFlt(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <p className="text-sm text-slate-500 mb-3">{list.length} produk</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {list.map(([x, i]) => (
              <ProductCard key={`${cur}-${i}`} catKey={cur} idx={i} item={x} />
            ))}
          </div>

          <p className="text-center py-16 text-slate-500" hidden={list.length > 0}>
            Produk tidak ditemukan.
          </p>
        </section>
      </div>
    </>
  );
}
