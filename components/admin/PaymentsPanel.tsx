"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/lib/icons";
import { rp } from "@/lib/format";
import type { AdminOverview } from "@/lib/admin-types";
import {
  FEE_TYPES,
  groupMethods,
  groupNames,
  isQris,
  type FeeType,
  type PaymentMethod,
} from "@/lib/payment-types";
import { Toast, type ToastData } from "./Toast";

/** Nilai form metode (biaya disimpan sebagai string selama diedit). */
type Draft = {
  name: string;
  grp: string;
  descr: string;
  fee_type: FeeType;
  fee_value: string;
  account_no: string;
  account_name: string;
  instructions: string;
  logo: string;
  active: boolean;
};

const emptyDraft = (grp: string): Draft => ({
  name: "",
  grp,
  descr: "",
  fee_type: "free",
  fee_value: "0",
  account_no: "",
  account_name: "",
  instructions: "",
  logo: "",
  active: false,
});

const draftFrom = (m: PaymentMethod): Draft => ({
  name: m.name,
  grp: m.grp,
  descr: m.descr,
  fee_type: m.fee_type,
  fee_value: String(m.fee_value),
  account_no: m.account_no,
  account_name: m.account_name,
  instructions: m.instructions,
  logo: m.logo ?? "",
  active: m.active,
});

function toBody(d: Draft) {
  return {
    name: d.name.trim(),
    grp: d.grp.trim(),
    descr: d.descr.trim(),
    fee_type: d.fee_type,
    fee_value: Number(d.fee_value || 0),
    account_no: d.account_no.trim(),
    account_name: d.account_name.trim(),
    instructions: d.instructions.trim(),
    logo: d.logo.trim() === "" ? null : d.logo.trim(),
    active: d.active,
  };
}

/** Teks biaya untuk ditampilkan di baris admin. */
function feeText(m: PaymentMethod): string {
  if (m.fee_type === "free") return "Gratis";
  if (m.fee_type === "percent") return `${m.fee_value}%`;
  return rp(m.fee_value);
}

/** Tab "Metode Pembayaran": kelola daftar metode yang tampil di checkout. */
export function PaymentsPanel({ onGoQris }: { onGoQris?: () => void }) {
  const [methods, setMethods] = useState<PaymentMethod[] | null>(null);
  const [canWrite, setCanWrite] = useState(true);
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [adding, setAdding] = useState<Draft | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [loadError, setLoadError] = useState("");

  const toastId = useCallback(() => Date.now(), []);
  const notify = useCallback((kind: ToastData["kind"], text: string) => {
    setToast({ id: toastId(), kind, text });
  }, [toastId]);
  const closeToast = useCallback(() => setToast(null), []);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/payments");
    const data = (await res.json().catch(() => null)) as
      | { methods?: PaymentMethod[]; error?: string }
      | null;
    if (!res.ok) {
      setLoadError(data?.error ?? "Gagal memuat metode pembayaran.");
      setMethods([]);
      return;
    }
    setLoadError("");
    setMethods(data?.methods ?? []);
  }, []);

  const loadAccess = useCallback(async () => {
    const res = await fetch("/api/admin/overview");
    if (res.ok) setCanWrite(((await res.json()) as AdminOverview).canWrite);
  }, []);

  useEffect(() => {
    void load();
    void loadAccess();
  }, [load, loadAccess]);

  async function patch(id: number, body: Record<string, unknown>, okMsg: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        notify("err", data?.error ?? "Gagal menyimpan perubahan.");
        return false;
      }
      await load();
      notify("ok", okMsg);
      return true;
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit(id: number) {
    if (!draft) return;
    if (!draft.name.trim()) return notify("err", "Nama metode wajib diisi.");
    const ok = await patch(id, toBody(draft), "Perubahan tersimpan.");
    if (ok) {
      setEditing(null);
      setDraft(null);
    }
  }

  async function createMethod() {
    if (!adding) return;
    if (!adding.name.trim()) return notify("err", "Nama metode wajib diisi.");
    if (!adding.grp.trim()) return notify("err", "Grup wajib diisi.");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toBody(adding)),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) return notify("err", data?.error ?? "Gagal menambah metode.");
      setAdding(null);
      await load();
      notify("ok", "Metode baru ditambahkan.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(m: PaymentMethod) {
    setConfirmId(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/payments/${m.id}`, { method: "DELETE" });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) return notify("err", data?.error ?? "Gagal menghapus metode.");
      await load();
      notify("ok", "Metode dihapus.");
    } finally {
      setBusy(false);
    }
  }

  async function move(m: PaymentMethod, dir: -1 | 1, siblings: PaymentMethod[]) {
    const i = siblings.findIndex((x) => x.id === m.id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= siblings.length) return;
    const other = siblings[j];
    setBusy(true);
    try {
      const [a, b] = await Promise.all([
        fetch(`/api/admin/payments/${m.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort: other.sort }),
        }),
        fetch(`/api/admin/payments/${other.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort: m.sort }),
        }),
      ]);
      if (!a.ok || !b.ok) {
        notify("err", "Gagal mengubah urutan.");
        return;
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  const groups = groupMethods(methods ?? []);
  const grpOptions = groupNames(methods ?? []);

  return (
    <>
      <Toast data={toast} onClose={closeToast} />

      {!canWrite && (
        <p className="adm-note adm-note--warn">
          <Icon name="alert" width={18} height={18} />
          <span>
            Kunci rahasia server (<b>SUPABASE_SECRET_KEY</b>) belum diisi, jadi metode hanya bisa
            dilihat. Tambahkan kunci itu untuk bisa menyimpan perubahan.
          </span>
        </p>
      )}

      <section className="adm-card">
        <div className="adm-card-head">
          <div>
            <h2>
              Metode pembayaran <span className="adm-count">({methods?.length ?? 0})</span>
            </h2>
            <p className="adm-hint">
              Hanya metode <b>aktif</b> yang muncul di checkout customer. QRIS memakai gambar dari tab
              QRIS.
            </p>
          </div>
          <button
            type="button"
            className={adding ? "adm-btn" : "adm-btn adm-btn--primary"}
            disabled={!canWrite}
            onClick={() => setAdding(adding ? null : emptyDraft(grpOptions[0] ?? ""))}
          >
            <Icon name={adding ? "x" : "card"} width={16} height={16} />
            {adding ? "Batal" : "Tambah metode"}
          </button>
        </div>

        {loadError && (
          <p className="adm-note adm-note--err" style={{ marginTop: 12 }}>
            <Icon name="alert" width={16} height={16} />
            <span>{loadError}</span>
          </p>
        )}

        {adding && (
          <div className="adm-subcard">
            <h3>Metode baru</h3>
            <PaymentFields
              draft={adding}
              grpOptions={grpOptions}
              onChange={setAdding}
              onSubmit={createMethod}
              onCancel={() => setAdding(null)}
              submitLabel="Simpan metode"
              busy={busy}
              isQrisRow={false}
            />
          </div>
        )}

        {methods === null ? (
          <p className="adm-empty" style={{ marginTop: 12 }}>
            Memuat…
          </p>
        ) : groups.length === 0 ? (
          <p className="adm-empty" style={{ marginTop: 12 }}>
            Belum ada metode. Jalankan supabase/payment_methods.sql lalu muat ulang halaman.
          </p>
        ) : (
          groups.map((g) => (
            <div key={g.grp} className="adm-subcard">
              <h3>{g.grp}</h3>
              <div className="adm-tbl">
                <table>
                  <thead>
                    <tr>
                      <th>Metode</th>
                      <th>Biaya</th>
                      <th>Rekening / VA</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.items.map((m, idx) =>
                      editing === m.id && draft ? (
                        <tr key={m.id}>
                          <td colSpan={5}>
                            <PaymentFields
                              draft={draft}
                              grpOptions={grpOptions}
                              onChange={setDraft}
                              onSubmit={() => saveEdit(m.id)}
                              onCancel={() => {
                                setEditing(null);
                                setDraft(null);
                              }}
                              submitLabel="Simpan"
                              busy={busy}
                              isQrisRow={isQris(m)}
                            />
                          </td>
                        </tr>
                      ) : (
                        <tr key={m.id}>
                          <td data-label="Metode">
                            <span className="adm-strong">{m.name}</span>
                            {m.descr ? (
                              <span className="adm-muted" style={{ display: "block" }}>
                                {m.descr}
                              </span>
                            ) : null}
                          </td>
                          <td data-label="Biaya" className="nowrap">
                            {feeText(m)}
                          </td>
                          <td data-label="Rekening / VA">
                            {isQris(m) ? (
                              <span className="adm-muted">— (pakai gambar QRIS)</span>
                            ) : m.account_no ? (
                              <>
                                <span className="adm-mono">{m.account_no}</span>
                                <span className="adm-muted" style={{ display: "block" }}>
                                  {m.account_name}
                                </span>
                              </>
                            ) : (
                              <span className="adm-muted">belum diisi</span>
                            )}
                          </td>
                          <td data-label="Status">
                            <label className="adm-switch">
                              <input
                                type="checkbox"
                                checked={m.active}
                                disabled={!canWrite || busy}
                                onChange={(e) =>
                                  void patch(
                                    m.id,
                                    { active: e.target.checked },
                                    e.target.checked ? "Metode diaktifkan." : "Metode dinonaktifkan.",
                                  )
                                }
                              />
                              <span className="adm-switch-track" />
                              <span className="adm-switch-tx">{m.active ? "Aktif" : "Nonaktif"}</span>
                            </label>
                          </td>
                          <td data-label="Aksi" className="adm-td-act">
                            <div className="adm-actions">
                              {confirmId === m.id ? (
                                <>
                                  <span className="adm-muted">Hapus metode ini?</span>
                                  <button
                                    type="button"
                                    className="adm-btn adm-btn--sm adm-btn--danger"
                                    disabled={busy}
                                    onClick={() => void remove(m)}
                                  >
                                    Ya, hapus
                                  </button>
                                  <button
                                    type="button"
                                    className="adm-btn adm-btn--sm"
                                    onClick={() => setConfirmId(null)}
                                  >
                                    Batal
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    className="adm-btn adm-btn--sm"
                                    disabled={!canWrite || busy}
                                    onClick={() => {
                                      setEditing(m.id);
                                      setDraft(draftFrom(m));
                                      setAdding(null);
                                    }}
                                  >
                                    Ubah
                                  </button>
                                  {isQris(m) ? (
                                    <button
                                      type="button"
                                      className="adm-btn adm-btn--sm"
                                      onClick={() => onGoQris?.()}
                                    >
                                      Ganti gambar
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      className="adm-btn adm-btn--sm adm-btn--danger"
                                      disabled={!canWrite || busy}
                                      onClick={() => setConfirmId(m.id)}
                                    >
                                      Hapus
                                    </button>
                                  )}
                                  <div className="adm-order">
                                    <button
                                      type="button"
                                      className="adm-btn adm-btn--sm"
                                      aria-label={`Naikkan ${m.name}`}
                                      disabled={!canWrite || busy || idx === 0}
                                      onClick={() => void move(m, -1, g.items)}
                                    >
                                      <Icon name="up" width={14} height={14} />
                                    </button>
                                    <button
                                      type="button"
                                      className="adm-btn adm-btn--sm"
                                      aria-label={`Turunkan ${m.name}`}
                                      disabled={!canWrite || busy || idx === g.items.length - 1}
                                      onClick={() => void move(m, 1, g.items)}
                                    >
                                      <Icon name="chev" width={14} height={14} />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </section>
    </>
  );
}

/** Field form metode (dipakai untuk ubah & tambah). */
function PaymentFields({
  draft,
  grpOptions,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  busy,
  isQrisRow,
}: {
  draft: Draft;
  grpOptions: string[];
  onChange: (d: Draft) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  submitLabel: string;
  busy: boolean;
  isQrisRow: boolean;
}) {
  const set = (patch: Partial<Draft>) => onChange({ ...draft, ...patch });

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
        <span className="adm-lbl">Nama metode</span>
        <input className="adm-inp" value={draft.name} onChange={(e) => set({ name: e.target.value })} required />
      </label>
      <label className="adm-field">
        <span className="adm-lbl">Grup</span>
        <input
          className="adm-inp"
          list="pm-groups"
          value={draft.grp}
          onChange={(e) => set({ grp: e.target.value })}
          placeholder="mis. Virtual Account"
          required
        />
        <datalist id="pm-groups">
          {grpOptions.map((g) => (
            <option key={g} value={g} />
          ))}
        </datalist>
      </label>
      <label className="adm-field">
        <span className="adm-lbl">Jenis biaya</span>
        <select
          className="adm-sel"
          value={draft.fee_type}
          onChange={(e) => set({ fee_type: e.target.value as FeeType })}
        >
          {FEE_TYPES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </label>
      <label className="adm-field">
        <span className="adm-lbl">
          Nilai biaya {draft.fee_type === "percent" ? "(%)" : "(Rp)"}
        </span>
        <input
          className="adm-inp"
          type="number"
          min={0}
          max={draft.fee_type === "percent" ? 100 : undefined}
          inputMode="numeric"
          value={draft.fee_value}
          disabled={draft.fee_type === "free"}
          onChange={(e) => set({ fee_value: e.target.value })}
        />
      </label>

      {!isQrisRow && (
        <>
          <label className="adm-field">
            <span className="adm-lbl">Nomor rekening / VA</span>
            <input
              className="adm-inp"
              value={draft.account_no}
              onChange={(e) => set({ account_no: e.target.value })}
              placeholder="wajib sebelum diaktifkan"
            />
          </label>
          <label className="adm-field">
            <span className="adm-lbl">Nama pemilik rekening</span>
            <input
              className="adm-inp"
              value={draft.account_name}
              onChange={(e) => set({ account_name: e.target.value })}
              placeholder="wajib sebelum diaktifkan"
            />
          </label>
        </>
      )}

      <label className="adm-field">
        <span className="adm-lbl">Deskripsi singkat</span>
        <input className="adm-inp" value={draft.descr} onChange={(e) => set({ descr: e.target.value })} />
      </label>

      <label className="adm-field">
        <span className="adm-lbl">Logo (URL, opsional)</span>
        <input className="adm-inp" value={draft.logo} onChange={(e) => set({ logo: e.target.value })} />
      </label>

      <label className="adm-field span2">
        <span className="adm-lbl">Instruksi pembayaran (opsional)</span>
        <textarea
          className="adm-inp adm-inp--area"
          rows={3}
          value={draft.instructions}
          onChange={(e) => set({ instructions: e.target.value })}
          placeholder="Ditampilkan ke customer di langkah pembayaran."
        />
      </label>

      <div className="adm-checks span2">
        <label className="adm-check">
          <input type="checkbox" checked={draft.active} onChange={(e) => set({ active: e.target.checked })} />
          Aktif (tampil di checkout)
        </label>
        {isQrisRow ? <span className="adm-muted">QRIS memakai gambar dari tab QRIS.</span> : null}
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
