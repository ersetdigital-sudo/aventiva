"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminOverview } from "@/lib/admin-types";
import { qrisUrl, supabaseEnabled } from "@/lib/supabase";

type Status = { ok: boolean; msg: string } | null;

/** Tab QRIS & sistem: unggah gambar QRIS dan cek status koneksi database. */
export function QrisPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [checking, setChecking] = useState(false);
  const [ver, setVer] = useState(0);

  const live = supabaseEnabled ? qrisUrl() : "";
  const currentQr = live ? `${live}${live.includes("?") ? "&" : "?"}v=${ver}` : "";

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const check = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/admin/overview");
      if (res.ok) setOverview((await res.json()) as AdminOverview);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

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
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold text-slate-900">Gambar QRIS</h2>
        <p className="mt-1 text-sm text-slate-500">
          Tersimpan di bucket <b>assets</b> sebagai <b>qris.png</b>, lalu tampil otomatis di dialog
          pembayaran. Ganti gambar cukup upload ulang.
        </p>
        <div className="mt-4 flex flex-wrap items-start gap-4">
          <div className="grid min-h-[168px] w-[168px] shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Pratinjau QRIS baru" className="h-full w-full object-contain" />
            ) : currentQr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={currentQr}
                src={currentQr}
                alt="Gambar QRIS tersimpan"
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const p = e.currentTarget.parentElement;
                  if (p)
                    p.innerHTML =
                      '<span style="font-size:13px;color:#64748B;padding:8px;text-align:center">Belum ada gambar</span>';
                }}
              />
            ) : (
              <span className="p-2 text-center text-[13px] text-slate-500">
                Supabase belum dikonfigurasi
              </span>
            )}
          </div>

          <form onSubmit={submit} className="min-w-[240px] flex-1 space-y-3">
            <label className="block text-sm font-medium text-slate-700" htmlFor="qrfile">
              Gambar QRIS (PNG/JPG, maks 4 MB)
            </label>
            <input
              id="qrfile"
              className="inp"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setFile(f);
                setPreview(f ? URL.createObjectURL(f) : null);
                setStatus(null);
              }}
            />
            <button className="btn-primary disabled:opacity-60" disabled={busy}>
              {busy ? "Mengupload…" : "Upload ke Supabase"}
            </button>
            {status ? (
              <p role="status" className={`text-sm ${status.ok ? "text-emerald-700" : "text-red-600"}`}>
                {status.msg}
              </p>
            ) : null}
          </form>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold text-slate-900">Status sistem</h2>
          <button type="button" className="chip font-medium" onClick={() => void check()} disabled={checking}>
            {checking ? "Memeriksa…" : "Cek ulang"}
          </button>
        </div>

        <ul className="mt-3 space-y-2 text-sm">
          <li className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2">
            <span className="font-medium text-slate-700">Situs membaca data dari Supabase</span>
            <span className={supabaseEnabled ? "text-emerald-700" : "text-amber-700"}>
              {supabaseEnabled ? "Aktif" : "Tidak aktif (pakai data statis)"}
            </span>
          </li>
          <li className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2">
            <span className="font-medium text-slate-700">Dashboard bisa menyimpan perubahan</span>
            <span className={overview?.canWrite ? "text-emerald-700" : "text-red-600"}>
              {overview === null
                ? "Memeriksa…"
                : overview.canWrite
                  ? "Aktif (kunci rahasia server)"
                  : "Belum — isi SUPABASE_SECRET_KEY"}
            </span>
          </li>
        </ul>

        {overview && overview.counts.length > 0 && (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {overview.counts.map((c) => (
              <li
                key={c.table}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <span className="font-medium text-slate-700">{c.table}</span>
                <span className={c.err ? "text-red-600" : "text-slate-500"} title={c.err ?? undefined}>
                  {c.err ? c.err : `${c.n} baris`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
