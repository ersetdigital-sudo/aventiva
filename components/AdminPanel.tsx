"use client";
import { useEffect, useState } from "react";
import { getSupabase, qrisUrl, supabaseEnabled } from "@/lib/supabase";

type Count = { table: string; n: number | null; err: string | null };
type Status = { ok: boolean; msg: string } | null;

const TABLES = ["categories", "products", "faqs", "site_settings", "transactions"];

/** Panel internal: upload gambar QRIS + status koneksi Supabase. */
export function AdminPanel() {
  const [key, setKey] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [counts, setCounts] = useState<Count[] | null>(null);
  const [pinging, setPinging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const live = qrisUrl();
  const [qrVer, setQrVer] = useState(0);
  const currentQr = `${live}${live.includes("?") ? "&" : "?"}v=${qrVer}`;

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  async function ping() {
    const sb = getSupabase();
    if (!sb) {
      setCounts(
        TABLES.map((t) => ({ table: t, n: null, err: "Supabase belum dikonfigurasi" })),
      );
      return;
    }
    setPinging(true);
    const out: Count[] = [];
    for (const t of TABLES) {
      const { count, error } = await sb.from(t).select("*", { count: "exact", head: true });
      // catatan: saat kunci ditolak, Supabase mengirim {message:""} (string kosong),
      // jadi cabang error harus dites keberadaannya, bukan kebenaran pesannya.
      out.push({
        table: t,
        n: error ? null : count ?? 0,
        err: error ? error.message || "ditolak — tabel belum dibuat / belum di-grant" : null,
      });
    }
    setCounts(out);
    setPinging(false);
  }

  useEffect(() => {
    void ping();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    if (!key) return setStatus({ ok: false, msg: "Isi kunci admin dulu." });
    if (!file) return setStatus({ ok: false, msg: "Pilih gambar QRIS dulu." });
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("key", key);
      fd.set("file", file);
      const res = await fetch("/api/admin/qris", { method: "POST", body: fd });
      const data = (await res.json()) as { ok: boolean; url?: string; error?: string };
      if (data.ok) {
        setQrVer(Date.now());
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
    <div className="max-w-[720px] space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold">Panel Admin</h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload gambar QRIS ke Supabase Storage dan cek status koneksi database.
        </p>
      </div>

      {/* koneksi */}
      <section className="bg-white rounded-2xl p-5 border border-slate-200">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="font-bold">Koneksi Supabase</h2>
          <button type="button" className="chip" onClick={ping} disabled={pinging}>
            {pinging ? "Memeriksa…" : "Cek ulang"}
          </button>
        </div>
        {!supabaseEnabled ? (
          <p className="text-sm text-red-600 mt-3">
            Env belum terisi. Tambahkan NEXT_PUBLIC_SUPABASE_URL &amp;
            NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY di .env.local lalu restart server.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {(counts ?? TABLES.map((t) => ({ table: t, n: null, err: null }))).map((c) => (
              <li
                key={c.table}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <span className="font-medium">{c.table}</span>
                <span className={c.err ? "text-red-600" : "text-slate-500"} title={c.err ?? undefined}>
                  {c.err ? c.err : `${c.n} baris`}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-slate-500 mt-3">
          Tabel kosong berarti <b>supabase/schema.sql</b> belum dijalankan. Katalog &amp; FAQ
          diisi lewat <b>supabase/seed.sql</b>.
        </p>
      </section>

      {/* upload QRIS */}
      <section className="bg-white rounded-2xl p-5 border border-slate-200">
        <h2 className="font-bold">Gambar QRIS</h2>
        <div className="mt-3 flex flex-wrap gap-4 items-start">
          <div className="w-[168px] shrink-0 rounded-xl border border-slate-200 bg-slate-50 grid place-items-center overflow-hidden min-h-[168px]">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Pratinjau QRIS baru" className="w-full h-full object-contain" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={currentQr}
                src={currentQr}
                alt="Gambar QRIS tersimpan"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const p = e.currentTarget.parentElement;
                  if (p) p.innerHTML = '<span style="font-size:13px;color:#64748B;padding:8px;text-align:center">Belum ada gambar</span>';
                }}
              />
            )}
          </div>

          <form onSubmit={submit} className="flex-1 min-w-[260px] space-y-3">
            <label className="block text-sm font-medium" htmlFor="adminkey">
              Kunci admin
            </label>
            <input
              id="adminkey"
              className="inp"
              type="password"
              autoComplete="off"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="ADMIN_KEY dari .env.local"
            />

            <label className="block text-sm font-medium" htmlFor="qrfile">
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

            <button className="btn-primary" disabled={busy}>
              {busy ? "Mengupload…" : "Upload ke Supabase"}
            </button>

            {status ? (
              <p
                role="status"
                className={`text-sm ${status.ok ? "text-emerald-700" : "text-red-600"}`}
              >
                {status.msg}
              </p>
            ) : null}

            <p className="text-xs text-slate-500">
              Tersimpan di bucket <b>assets</b> sebagai <b>qris.png</b>, lalu tampil otomatis di
              dialog pembayaran. Ganti gambar cukup upload ulang.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
