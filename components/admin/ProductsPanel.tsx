"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminCategory, AdminOverview, AdminProduct } from "@/lib/admin-types";
import { rp } from "@/lib/format";

/** Nilai form produk (harga disimpan sebagai string selama diedit). */
type Draft = {
  cat_key: string;
  n: string;
  b: string;
  f: string;
  d: string;
  p: string;
  o: string;
  bill: boolean;
  soldout: boolean;
};

const emptyDraft = (catKey: string): Draft => ({
  cat_key: catKey,
  n: "",
  b: "",
  f: "",
  d: "",
  p: "",
  o: "",
  bill: false,
  soldout: false,
});

const draftFrom = (p: AdminProduct): Draft => ({
  cat_key: p.cat_key,
  n: p.n,
  b: p.b,
  f: p.f,
  d: p.d,
  p: String(p.p),
  o: p.o === null ? "" : String(p.o),
  bill: p.bill,
  soldout: p.soldout,
});

/** Ubah draft form jadi body API (angka + null untuk harga coret kosong). */
function toBody(d: Draft) {
  return {
    cat_key: d.cat_key,
    n: d.n.trim(),
    b: d.b.trim(),
    f: d.f.trim(),
    d: d.d.trim(),
    p: Number(d.p || 0),
    o: d.o.trim() === "" ? null : Number(d.o),
    bill: d.bill,
    soldout: d.soldout,
  };
}

/** Tab produk: daftar per kategori, ubah harga, tambah, dan hapus produk. */
export function ProductsPanel() {
  const [cats, setCats] = useState<AdminCategory[]>([]);
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [canWrite, setCanWrite] = useState(true);
  const [cat, setCat] = useState("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [adding, setAdding] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/products");
    const data = (await res.json().catch(() => null)) as
      | { categories?: AdminCategory[]; products?: AdminProduct[]; error?: string }
      | null;
    if (!res.ok) {
      setError(data?.error ?? "Gagal memuat katalog.");
      setProducts([]);
      return;
    }
    setCats(data?.categories ?? []);
    setProducts(data?.products ?? []);
  }, []);

  const loadAccess = useCallback(async () => {
    const res = await fetch("/api/admin/overview");
    if (res.ok) setCanWrite(((await res.json()) as AdminOverview).canWrite);
  }, []);

  useEffect(() => {
    void load();
    void loadAccess();
  }, [load, loadAccess]);

  function flash(text: string, isError = false) {
    if (isError) setError(text);
    else {
      setMsg(text);
      setError("");
    }
    window.setTimeout(() => (isError ? setError("") : setMsg("")), 2500);
  }

  async function saveEdit(id: number) {
    if (!draft) return;
    if (!draft.n.trim()) return flash("Nama produk wajib diisi.", true);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toBody(draft)),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) return flash(data?.error ?? "Gagal menyimpan produk.", true);
      setEditing(null);
      setDraft(null);
      await load();
      flash("Perubahan tersimpan.");
    } finally {
      setBusy(false);
    }
  }

  async function createProduct() {
    if (!adding) return;
    if (!adding.n.trim()) return flash("Nama produk wajib diisi.", true);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toBody(adding)),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) return flash(data?.error ?? "Gagal menambah produk.", true);
      setAdding(null);
      await load();
      flash("Produk baru ditambahkan.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(p: AdminProduct) {
    if (!window.confirm(`Hapus produk "${p.n}" (${p.b})?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) return flash(data?.error ?? "Gagal menghapus produk.", true);
      await load();
      flash("Produk dihapus.");
    } finally {
      setBusy(false);
    }
  }

  const needle = search.trim().toLowerCase();
  const list = (products ?? []).filter(
    (p) =>
      (cat === "all" || p.cat_key === cat) &&
      (needle === "" ||
        p.n.toLowerCase().includes(needle) ||
        p.b.toLowerCase().includes(needle) ||
        p.f.toLowerCase().includes(needle)),
  );
  const catName = (key: string) => cats.find((c) => c.key === key)?.name ?? key;

  return (
    <div className="space-y-5">
      {!canWrite && (
        <p className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Kunci rahasia server (<b>SUPABASE_SECRET_KEY</b>) belum diisi, jadi katalog hanya bisa
          dilihat. Tambahkan kunci itu lewat menu Secrets untuk bisa menyimpan perubahan.
        </p>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="mr-auto font-bold text-slate-900">
            Katalog produk <span className="font-normal text-slate-500">({list.length})</span>
          </h2>
          <input
            className="inp !mt-0 w-[200px] !py-2 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk / brand"
            aria-label="Cari produk"
          />
          <button
            type="button"
            className="chip font-medium"
            disabled={!canWrite}
            onClick={() =>
              setAdding(adding ? null : emptyDraft(cat !== "all" ? cat : (cats[0]?.key ?? "")))
            }
          >
            {adding ? "Batal" : "+ Tambah produk"}
          </button>
        </div>

        <div className="noscroll mt-3 flex gap-2 overflow-x-auto pb-1">
          <button type="button" className="chip" aria-pressed={cat === "all"} onClick={() => setCat("all")}>
            Semua kategori
          </button>
          {cats.map((c) => (
            <button key={c.key} type="button" className="chip" aria-pressed={cat === c.key} onClick={() => setCat(c.key)}>
              {c.name}
            </button>
          ))}
        </div>

        {(msg || error) && (
          <p className={`mt-3 text-sm ${error ? "text-red-600" : "text-emerald-700"}`}>{error || msg}</p>
        )}

        {adding && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-semibold text-slate-800">Produk baru</h3>
            <ProductFields
              draft={adding}
              cats={cats}
              onChange={setAdding}
              onSubmit={createProduct}
              submitLabel="Simpan produk"
              busy={busy}
            />
          </div>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-3 font-semibold">Produk</th>
                <th className="py-2 pr-3 font-semibold">Kategori</th>
                <th className="py-2 pr-3 font-semibold">Harga</th>
                <th className="py-2 pr-3 font-semibold">Coret</th>
                <th className="py-2 pr-3 font-semibold">Status</th>
                <th className="py-2 pr-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products === null ? (
                <tr>
                  <td className="py-3 text-slate-500" colSpan={6}>
                    Memuat…
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td className="py-3 text-slate-500" colSpan={6}>
                    Tidak ada produk yang cocok.
                  </td>
                </tr>
              ) : (
                list.map((p) =>
                  editing === p.id && draft ? (
                    <tr key={p.id} className="border-b border-slate-100 bg-slate-50">
                      <td colSpan={6} className="py-3 pr-3">
                        <ProductFields
                          draft={draft}
                          cats={cats}
                          onChange={setDraft}
                          onSubmit={() => saveEdit(p.id)}
                          onCancel={() => {
                            setEditing(null);
                            setDraft(null);
                          }}
                          submitLabel="Simpan"
                          busy={busy}
                        />
                      </td>
                    </tr>
                  ) : (
                    <tr key={p.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pr-3">
                        <span className="font-medium text-slate-800">{p.n}</span>
                        <span className="block text-xs text-slate-500">
                          {[p.b, p.f, p.d].filter(Boolean).join(" · ")}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-slate-700">{catName(p.cat_key)}</td>
                      <td className="py-3 pr-3 whitespace-nowrap font-semibold text-slate-800">
                        {p.bill ? "Sesuai tagihan" : rp(p.p)}
                      </td>
                      <td className="py-3 pr-3 whitespace-nowrap text-slate-500">
                        {p.o === null ? "—" : rp(p.o)}
                      </td>
                      <td className="py-3 pr-3">
                        {p.soldout ? (
                          <span className="st st-failed whitespace-nowrap">Habis</span>
                        ) : (
                          <span className="st st-success whitespace-nowrap">Tersedia</span>
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="chip"
                            disabled={!canWrite}
                            onClick={() => {
                              setEditing(p.id);
                              setDraft(draftFrom(p));
                            }}
                          >
                            Ubah
                          </button>
                          <button
                            type="button"
                            className="chip text-red-600"
                            disabled={!canWrite}
                            onClick={() => void remove(p)}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/** Field form produk (dipakai untuk ubah & tambah). */
function ProductFields({
  draft,
  cats,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  busy,
}: {
  draft: Draft;
  cats: AdminCategory[];
  onChange: (d: Draft) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  submitLabel: string;
  busy: boolean;
}) {
  const set = (patch: Partial<Draft>) => onChange({ ...draft, ...patch });
  const activeCat = cats.find((c) => c.key === draft.cat_key);

  return (
    <form
      className="mt-3 grid gap-3 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <label className="text-xs font-medium text-slate-600">
        Kategori
        <select className="inp !py-2 text-sm" value={draft.cat_key} onChange={(e) => set({ cat_key: e.target.value })}>
          {cats.map((c) => (
            <option key={c.key} value={c.key}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs font-medium text-slate-600">
        Nama produk
        <input className="inp !py-2 text-sm" value={draft.n} onChange={(e) => set({ n: e.target.value })} required />
      </label>
      <label className="text-xs font-medium text-slate-600">
        Brand / penyedia
        <input className="inp !py-2 text-sm" value={draft.b} onChange={(e) => set({ b: e.target.value })} />
      </label>
      <label className="text-xs font-medium text-slate-600">
        Filter (sub-kategori)
        <input className="inp !py-2 text-sm" value={draft.f} onChange={(e) => set({ f: e.target.value })} />
      </label>
      <label className="text-xs font-medium text-slate-600">
        Harga jual (Rp)
        <input
          className="inp !py-2 text-sm"
          type="number"
          min={0}
          value={draft.p}
          onChange={(e) => set({ p: e.target.value })}
        />
      </label>
      <label className="text-xs font-medium text-slate-600">
        Harga coret (opsional)
        <input
          className="inp !py-2 text-sm"
          type="number"
          min={0}
          value={draft.o}
          onChange={(e) => set({ o: e.target.value })}
        />
      </label>
      <label className="text-xs font-medium text-slate-600 sm:col-span-2">
        Keterangan singkat
        <input className="inp !py-2 text-sm" value={draft.d} onChange={(e) => set({ d: e.target.value })} />
      </label>
      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-700 sm:col-span-2">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={draft.bill} onChange={(e) => set({ bill: e.target.checked })} />
          Produk tagihan (harga dicek saat bayar)
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={draft.soldout} onChange={(e) => set({ soldout: e.target.checked })} />
          Stok habis
        </label>
        {activeCat ? (
          <span className="text-xs text-slate-500">Biaya admin kategori: {rp(activeCat.admin)}</span>
        ) : null}
      </div>
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" className="btn-primary !py-2 text-sm disabled:opacity-60" disabled={busy}>
          {busy ? "Menyimpan…" : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="chip font-medium" onClick={onCancel}>
            Batal
          </button>
        )}
      </div>
    </form>
  );
}
