"use client";
import type { ProductItem } from "@/data/categories";
import { BRAND_BADGE, BRAND_DARK, brandInitial } from "@/lib/brands";
import { rp } from "@/lib/format";
import { useShop } from "@/lib/shop-context";

const CHECK = (
  <svg
    viewBox="0 0 16 16"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m3.5 8.5 3 3 6-7" />
  </svg>
);

export function ProductCard({ catKey, idx, item }: { catKey: string; idx: number; item: ProductItem }) {
  const { open } = useShop();
  const bg = BRAND_BADGE[item.b] ?? "#4338CA";
  const dark = BRAND_DARK.has(item.b);
  const disc = !item.bill && item.o && item.o > item.p ? Math.round((1 - item.p / item.o) * 100) : 0;
  const out = !!item.soldout;

  const price = item.bill ? (
    <>
      <div className="pc-row">
        <span className="pc-price">Cek tagihan</span>
      </div>
      <span className="pc-note">Nominal sesuai tagihan</span>
    </>
  ) : (
    <>
      <div className="pc-row">
        <span className="pc-price">{rp(item.p)}</span>
        {item.o ? <s className="pc-old">{rp(item.o)}</s> : null}
      </div>
      <div className="pc-save-line">
        {item.o && item.o > item.p ? (
          <span className="pc-save">Hemat {rp(item.o - item.p)}</span>
        ) : null}
      </div>
    </>
  );

  return (
    <article className={`pc${out ? " pc--out" : ""}`}>
      <div className="pc-head">
        <span className="pc-logo" style={{ background: bg, color: dark ? "#1B1B4B" : "#fff" }}>
          {brandInitial(item.b)}
        </span>
        <span className="pc-op">{item.b}</span>
        {out ? (
          <span className="pc-disc pc-disc--out">Habis</span>
        ) : disc ? (
          <span className="pc-disc">−{disc}%</span>
        ) : null}
      </div>
      <h3 className="pc-name">{item.n}</h3>
      <div className="pc-sub">
        {CHECK}
        <span>{item.d}</span>
      </div>
      <div className="pc-pb">{price}</div>
      <button
        type="button"
        className="pc-btn"
        disabled={out}
        aria-disabled={out}
        onClick={() => open(catKey, idx)}
      >
        {out ? "Stok habis" : "Beli"}
      </button>
    </article>
  );
}

/** Kartu skeleton (loading). */
export function ProductSkeleton() {
  return (
    <div className="pc pc--skel" aria-hidden="true">
      <div className="pc-head">
        <span className="sk sk-c" />
        <span className="sk" style={{ width: 60, height: 12 }} />
      </div>
      <span className="sk" style={{ width: "75%", height: 20 }} />
      <span className="sk" style={{ width: "60%", height: 12, marginTop: 8 }} />
      <div className="pc-pb">
        <span className="sk" style={{ width: "55%", height: 22 }} />
        <span className="sk" style={{ width: "40%", height: 18, marginTop: 10 }} />
      </div>
      <span className="sk" style={{ height: 44, marginTop: "auto", borderRadius: 12 }} />
    </div>
  );
}
