"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/lib/icons";
import { loadQris, supabaseEnabled } from "@/lib/supabase";
import { Toast, type ToastData } from "./Toast";

const MAX_BYTES = 4 * 1024 * 1024;
const OK_TYPES = ["image/png", "image/jpeg"];

/** Ubah pesan error dari server jadi teks yang ramah untuk admin. */
function errorText(msg?: string): string {
  const m = (msg ?? "").toLowerCase();
  if (m.includes("4 mb") || m.includes("ukuran")) return "Ukuran file melebihi 4 MB";
  if (m.includes("png") || m.includes("jpg") || m.includes("format") || m.includes("gambar"))
    return "Format harus PNG atau JPG";
  return "Gagal mengunggah, coba lagi";
}

/** Tab QRIS: unggah gambar QRIS yang tampil di dialog pembayaran. */
export function QrisPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const toastId = useRef(0);

  // URL gambar tersimpan + versinya — sumber sama dengan dialog customer
  const refreshQris = useCallback(async () => {
    const q = await loadQris();
    setQrSrc(q.ok ? q.url : null);
  }, []);

  const notify = useCallback((kind: ToastData["kind"], text: string) => {
    toastId.current += 1;
    setToast({ id: toastId.current, kind, text });
  }, []);
  const closeToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  // muat gambar tersimpan saat tab dibuka, dan lagi tiap habis upload
  useEffect(() => {
    void refreshQris();
  }, [refreshQris]);

  /** Kosongkan pilihan file: state + input bawaan (nama file balik ke placeholder). */
  function clearFile() {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function pick(f: File | null) {
    if (!f) {
      clearFile();
      return;
    }
    if (!OK_TYPES.includes(f.type)) {
      notify("err", "Format harus PNG atau JPG");
      clearFile();
      return;
    }
    if (f.size > MAX_BYTES) {
      notify("err", "Ukuran file melebihi 4 MB");
      clearFile();
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || busy) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/admin/qris", { method: "POST", body: fd });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (res.ok && data?.ok) {
        await refreshQris();
        clearFile();
        notify("ok", "QRIS berhasil diperbarui");
      } else {
        notify("err", errorText(data?.error));
      }
    } catch {
      notify("err", "Gagal mengunggah, coba lagi");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="adm-card">
      <Toast data={toast} onClose={closeToast} />

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
          ) : qrSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={qrSrc}
              src={qrSrc}
              alt="Gambar QRIS tersimpan"
              onError={() => setQrSrc(null)}
            />
          ) : (
            <span className="adm-drop-note">
              {supabaseEnabled ? "Belum ada gambar" : "Supabase belum dikonfigurasi"}
            </span>
          )}
        </div>

        <form onSubmit={submit} className="adm-qris-form">
          <span className="adm-lbl" id="qrf-label">
            Pilih gambar QRIS
          </span>
          <input
            id="qrfile"
            ref={inputRef}
            className="adm-file-native"
            type="file"
            accept="image/png,image/jpeg"
            aria-labelledby="qrf-label"
            disabled={busy}
            onChange={(e) => pick(e.target.files?.[0] ?? null)}
          />
          <div className="adm-file-row">
            <label htmlFor="qrfile" className={`adm-file-btn${busy ? " is-disabled" : ""}`}>
              Pilih Gambar
            </label>
            <span className="adm-file-name">{file ? file.name : "Belum ada file dipilih"}</span>
          </div>

          <div className={`adm-upload${file ? " is-open" : ""}`} aria-hidden={!file}>
            <button
              type="submit"
              className="adm-btn adm-btn--accent adm-btn--block"
              disabled={busy}
              tabIndex={file ? 0 : -1}
            >
              {busy ? (
                <>
                  <span className="adm-spin" aria-hidden="true" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Icon name="upload" width={16} height={16} />
                  Perbarui QRIS
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
