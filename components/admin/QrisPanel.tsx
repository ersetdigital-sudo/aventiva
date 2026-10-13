"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/lib/icons";
import { qrisUrl, supabaseEnabled } from "@/lib/supabase";

type Status = { ok: boolean; msg: string } | null;

/** Tab QRIS: unggah gambar QRIS yang tampil di dialog pembayaran. */
export function QrisPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [ver, setVer] = useState(0);

  const live = supabaseEnabled ? qrisUrl() : "";
  const currentQr = live ? `${live}${live.includes("?") ? "&" : "?"}v=${ver}` : "";

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    if (!file) return setStatus({ ok: false, msg: "Pilih gambar QRIS dulu." });
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/admin/qris", { method: "POST", body: fd });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        setVer(Date.now());
        setPreview(null);
        setFile(null);
        setStatus({ ok: true, msg: "Gambar QRIS tersimpan di Supabase Storage." });
      } else {
        setStatus({ ok: false, msg: data.error ?? "Upload gagal." });
      }
    } catch (err) {
      setStatus({ ok: false, msg: `Gagal menghubungi server. ${String(err)}` });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="adm-card">
      <div className="adm-card-head">
        <div>
          <h2>Gambar QRIS</h2>
          <p className="adm-hint">
            Tersimpan di bucket <b>assets</b> sebagai <b>qris.png</b>, lalu tampil otomatis di dialog
            pembayaran. Ganti gambar cukup upload ulang.
          </p>
        </div>
        <span className="adm-badge">PNG / JPG · maks 4 MB</span>
      </div>

      <div className="adm-qris">
        <div className="adm-drop">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Pratinjau QRIS baru" />
          ) : currentQr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={currentQr}
              src={currentQr}
              alt="Gambar QRIS tersimpan"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const p = e.currentTarget.parentElement;
                if (p) p.innerHTML = '<span class="adm-drop-note">Belum ada gambar</span>';
              }}
            />
          ) : (
            <span className="adm-drop-note">Supabase belum dikonfigurasi</span>
          )}
        </div>

        <form onSubmit={submit} className="adm-qris-form">
          <label className="adm-lbl" htmlFor="qrfile">
            Pilih gambar QRIS
          </label>
          <input
            id="qrfile"
            className="adm-file"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setFile(f);
              setPreview(f ? URL.createObjectURL(f) : null);
              setStatus(null);
            }}
          />
          <button className="adm-btn adm-btn--accent adm-btn--block" disabled={busy}>
            <Icon name="up" width={16} height={16} />
            {busy ? "Mengupload…" : "Upload ke Supabase"}
          </button>
          {status ? (
            <p
              role="status"
              className={`adm-note ${status.ok ? "adm-note--ok" : "adm-note--err"}`}
            >
              <Icon name={status.ok ? "check" : "alert"} width={16} height={16} />
              <span>{status.msg}</span>
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
