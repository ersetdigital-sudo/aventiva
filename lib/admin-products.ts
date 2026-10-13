/** Validasi body produk untuk route admin (dipakai POST dan PATCH). */

const num = (v: unknown): number => {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "") return Number(v);
  return NaN;
};

const text = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);

/**
 * Bersihkan field produk dari request. `partial` = true untuk PATCH
 * (hanya field yang dikirim yang diperbarui).
 */
export function cleanProduct(
  body: Record<string, unknown>,
  partial: boolean,
): { ok: true; value: Record<string, unknown> } | { ok: false; error: string } {
  const out: Record<string, unknown> = {};

  if (!partial || "cat_key" in body) {
    const cat = text(body.cat_key, 40);
    if (!cat) return { ok: false, error: "Kategori wajib dipilih." };
    out.cat_key = cat;
  }

  if (!partial || "n" in body) {
    const n = text(body.n, 120);
    if (!n) return { ok: false, error: "Nama produk wajib diisi." };
    out.n = n;
  }

  for (const key of ["b", "f", "d"] as const) {
    if (!partial || key in body) out[key] = text(body[key]);
  }

  if (!partial || "p" in body) {
    const p = num(body.p);
    if (!Number.isFinite(p) || p < 0) return { ok: false, error: "Harga jual tidak valid." };
    out.p = Math.round(p);
  }

  if (!partial || "o" in body) {
    const raw = body.o;
    if (raw === null || raw === undefined || String(raw).trim() === "") out.o = null;
    else {
      const o = num(raw);
      if (!Number.isFinite(o) || o < 0) return { ok: false, error: "Harga coret tidak valid." };
      out.o = Math.round(o);
    }
  }

  for (const key of ["bill", "soldout"] as const) {
    if (!partial || key in body) out[key] = Boolean(body[key]);
  }

  return { ok: true, value: out };
}

/** Kategori hanya boleh diisi dari daftar yang ada. */
export function categoryExists(keys: string[], key: string): boolean {
  return keys.includes(key);
}
