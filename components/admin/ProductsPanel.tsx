"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/lib/icons";
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
    <>
      {!canWrite && (
        <p className="adm-note adm-note--warn">
          <Icon name="alert" width={18} height={18} />
          <span>
            Kunci rahasia server (<b>SUPABASE_SECRET_KEY</b>) belum diisi, jadi katalog hanya bisa
            dilihat. Tambahkan kunci itu lewat menu Secrets untuk bisa menyimpan perubahan.
          </span>
        </p>
      )}

      <section className="adm-card">
        <div className="adm-card-head">
          <div>
            <h2>
              Katalog produk <span className="adm-count">({list.length})</span>
            </h2>
            <p className="adm-hint">
              Ubah harga, tandai stok habis, atau tambah produk baru. Perubahan langsung dipakai situs.
            </p>
          </div>
          <button
            type="button"
            className={adding ? "adm-btn" : "adm-btn adm-btn--primary"}
            disabled={!canWrite}
            onClick={() =>
              setAdding(adding ? null : emptyDraft(cat !== "all" ? cat : (cats[0]?.key ?? "")))
            }
          >
            <Icon name={adding ? "x" : "tag"} width={16} height={16} />
            {adding ? "Batal" : "Tambah produk"}
          </button>
        </div>

        <div className="adm-tools">
          <div className="adm-search">
            <Icon name="search" width={16} height={16} />
            <input
              className="adm-inp"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk / brand"
              aria-label="Cari produk"
            />
          </div>
        </div>

        <div className="adm-chips">
          <button type="button" className="adm-chip" aria-pressed={cat === "all"} onClick={() => setCat("all")}>
            Semua kategori
          </button>
          {cats.map((c) => (
            <button
              key={c.key}
              type="button"
              className="adm-chip"
              aria-pressed={cat === c.key}
              onClick={() => setCat(c.key)}
            >
              {c.name}
            </button>
          ))}
        </div>

        {error || msg ? (
          <p
            className={`adm-note ${error ? "adm-note--err" : "adm-note--ok"}`}
            style={{ marginTop: 12 }}
          >
            <Icon name={error ? "alert" : "check"} width={16} height={16} />
            <span>{error || msg}</span>
          </p>
        ) : null}

        {adding && (
          <div className="adm-subcard">
            <h3>Produk baru</h3>
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

        <div className="adm-tbl">
          <table>
            <thead>
              <tr>
                <th>Produk</th>
                <th>Kategori</th>
                <th>Harga</th>
                <th>Coret</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products === null ? (
                <tr>
                  <td className="adm-empty" colSpan={6}>
                    Memuat…
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td className="adm-empty" colSpan={6}>
                    Tidak ada produk yang cocok.
                  </td>
                </tr>
              ) : (
                list.map((p) =>
                  editing === p.id && draft ? (
                    <tr key={p.id}>
                      <td colSpan={6}>
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
                    <tr key={p.id}>
                      <td data-label="Produk">
                        <span className="adm-strong">{p.n}</span>
                        <span className="adm-muted" style={{ display: "block" }}>
                          {[p.b, p.f, p.d].filter(Boolean).join(" · ")}
                        </span>
                      </td>
                      <td data-label="Kategori">{catName(p.cat_key)}</td>
                      <td data-label="Harga" className="nowrap">
                        <span className="adm-strong">{p.bill ? "Sesuai tagihan" : rp(p.p)}</span>
                      </td>
                      <td data-label="Coret" className="nowrap">
                        <span className="adm-muted">{p.o === null ? "—" : rp(p.o)}</span>
                      </td>
                      <td data-label="Status">
                        {p.soldout ? (
                          <span className="st st-failed">Habis</span>
                        ) : (
                          <span className="st st-success">Tersedia</span>
                        )}
                      </td>
                      <td data-label="Aksi" className="adm-td-act">
                        <div className="adm-actions">
                          <button
                            type="button"
                            className="adm-btn adm-btn--sm"
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
                            className="adm-btn adm-btn--sm adm-btn--danger"
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
    </>
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
      className="adm-form"
      style={{ marginTop: 14 }}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <label className="adm-field">
        <span className="adm-lbl">Kategori</span>
        <select className="adm-sel" value={draft.cat_key} onChange={(e) => set({ cat_key: e.target.value })}>
          {cats.map((c) => (
            <option key={c.key} value={c.key}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="adm-field">
        <span className="adm-lbl">Nama produk</span>
        <input className="adm-inp" value={draft.n} onChange={(e) => set({ n: e.target.value })} required />
      </label>
      <label className="adm-field">
        <span className="adm-lbl">Brand / penyedia</span>
        <input className="adm-inp" value={draft.b} onChange={(e) => set({ b: e.target.value })} />
      </label>
      <label className="adm-field">
        <span className="adm-lbl">Filter (sub-kategori)</span>
        <input className="adm-inp" value={draft.f} onChange={(e) => set({ f: e.target.value })} />
      </label>
      <label className="adm-field">
        <span className="adm-lbl">Harga jual (Rp)</span>
        <input
          className="adm-inp"
          type="number"
          min={0}
          inputMode="numeric"
          value={draft.p}
          onChange={(e) => set({ p: e.target.value })}
        />
      </label>
      <label className="adm-field">
        <span className="adm-lbl">Harga coret (opsional)</span>
        <input
          className="adm-inp"
          type="number"
          min={0}
          inputMode="numeric"
          value={draft.o}
          onChange={(e) => set({ o: e.target.value })}
        />
      </label>
      <label className="adm-field span2">
        <span className="adm-lbl">Keterangan singkat</span>
        <input className="adm-inp" value={draft.d} onChange={(e) => set({ d: e.target.value })} />
      </label>
      <div className="adm-checks span2">
        <label className="adm-check">
          <input type="checkbox" checked={draft.bill} onChange={(e) => set({ bill: e.target.checked })} />
          Produk tagihan (harga dicek saat bayar)
        </label>
        <label className="adm-check">
          <input type="checkbox" checked={draft.soldout} onChange={(e) => set({ soldout: e.target.checked })} />
          Stok habis
        </label>
        {activeCat ? <span className="adm-muted">Biaya admin kategori: {rp(activeCat.admin)}</span> : null}
      </div>
      <div className="adm-actions span2">
        <button type="submit" className="adm-btn adm-btn--primary" disabled={busy}>
          {busy ? "Menyimpan…" : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="adm-btn" onClick={onCancel}>
            Batal
          </button>
        )}
      </div>
    </form>
  );
}
