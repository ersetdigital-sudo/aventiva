"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSite } from "@/lib/site-context";
import { lookupTransaction } from "@/lib/db";
import { fmtDate, rp } from "@/lib/format";
import type { Status, Tx } from "@/lib/tx-types";

const H = 36e5;

const ST: Record<Status, [string, string]> = {
  pending: ["Menunggu Pembayaran", "st-pending"],
  process: ["Diproses", "st-process"],
  success: ["Berhasil", "st-success"],
  failed: ["Gagal", "st-failed"],
  expired: ["Kedaluwarsa", "st-expired"],
};

/** Data contoh (dibuat saat dipakai agar timestamp selalu segar). */
function demo(): Tx[] {
  const now = Date.now();
  return [
    { id: "AVD-DEMO1", n: "Token PLN 100.000", t: "14012345678", p: 102500, d: now - 2 * H, s: "success", token: "4821 0937 5512 6604 1188" },
    { id: "AVD-DEMO2", n: "Pulsa Telkomsel 50.000", t: "081234567890", p: 51500, d: now - 0.3 * H, s: "process" },
    { id: "AVD-DEMO3", n: "Paket Data XL 10GB", t: "087812345678", p: 65000, d: now - 26 * H, s: "failed" },
    { id: "AVD-DEMO4", n: "Saldo DANA 100.000", t: "085712345678", p: 101000, d: now - 0.1 * H, s: "pending" },
    { id: "AVD-DEMO5", n: "Pulsa Indosat 25.000", t: "085612345678", p: 26750, d: now - 72 * H, s: "expired" },
  ];
}

function all(): Tx[] {
  let list: (Tx & { k?: string })[] = [];
  try {
    list = JSON.parse(localStorage.getItem("avd_tx") || "[]");
  } catch {
    list = [];
  }
  return list.map((x) => ({ ...x, n: x.n.replace(" – ", " ") })).concat(demo());
}

const CHECK = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
    <path d="m5 12 5 5 9-10" />
  </svg>
);

const CROSS = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export function CekTransaksiView() {
  const params = useSearchParams();
  const pre = params.get("id");
  const site = useSite();

  const [value, setValue] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [tx, setTx] = useState<Tx | null>(null);
  const [missing, setMissing] = useState(false);
  const [idLabel, setIdLabel] = useState("Salin");
  const [tokenLabel, setTokenLabel] = useState("Salin Token");

  async function lookup(v: string) {
    const okId = /^AVD-[A-Z0-9]{4,}$/i.test(v);
    const okNum = /^\d{8,16}$/.test(v.replace(/[\s-]/g, ""));
    if (!v || !(okId || okNum)) {
      setErr(v ? "Format tidak valid. Gunakan ID transaksi (AVD-…) atau nomor 8–16 digit." : "Kolom ini wajib diisi.");
      return;
    }
    setErr("");
    setBusy(true);
    setTx(null);
    setMissing(false);

    const k = v.toUpperCase();
    const n = v.replace(/[\s-]/g, "");

    // database dulu, cadangan lokal menyusul (tetap ~700ms seperti sebelumnya)
    const [remote, local] = await Promise.all([
      lookupTransaction(okId ? k : n, okId),
      new Promise<Tx | null>((resolve) => {
        window.setTimeout(() => {
          resolve(all().find((t) => (okId ? t.id.toUpperCase() === k : t.t === n)) ?? null);
        }, 700);
      }),
    ]);

    setBusy(false);
    const found = remote ?? local;
    if (found) setTx(found);
    else setMissing(true);
  }

  // ?id=… → langsung cek sekali setelah halaman siap
  useEffect(() => {
    if (!pre) return;
    setValue(pre);
    lookup(pre);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pre]);

  async function copy(text: string, setLabel: (s: string) => void, resetLabel: string) {
    try {
      await navigator.clipboard.writeText(text);
      setLabel("Tersalin ✓");
      window.setTimeout(() => setLabel(resetLabel), 1500);
    } catch {
      setLabel("Gagal salin");
      window.setTimeout(() => setLabel(resetLabel), 1500);
    }
  }

  return (
    <>
      <nav className="crumb" aria-label="Breadcrumb">
        <Link href="/">Beranda</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Cek Transaksi</span>
      </nav>

      <div className="sp-narrow">
        <h1 className="sp-title">Cek Status Transaksi</h1>
        <p className="sp-sub">Masukkan ID transaksi atau nomor tujuan untuk melihat status pesananmu.</p>

        <form
          className="sp-card"
          style={{ marginTop: 24 }}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            lookup(value.trim());
          }}
        >
          <label className="f-lbl" htmlFor="key">
            ID Transaksi / Nomor HP / ID Pelanggan
          </label>
          <div className="f-field">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              id="key"
              className="f-inp"
              autoComplete="off"
              placeholder="Contoh: AVD-DEMO1 atau 081234567890"
              aria-describedby="err hint"
              aria-invalid={err ? true : undefined}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (err) setErr("");
              }}
            />
          </div>
          <p id="err" className="f-err" role="alert">
            {err}
          </p>
          <p id="hint" className="f-hint">
            Coba data contoh: AVD-DEMO1 (berhasil, token PLN), AVD-DEMO2 (diproses), AVD-DEMO3 (gagal),
            AVD-DEMO4 (menunggu), AVD-DEMO5 (kedaluwarsa).
          </p>
          <button id="btn" className="btn-p" style={{ width: "100%", marginTop: 16 }} disabled={busy}>
            {busy ? (
              <>
                <span className="spin" aria-hidden="true" /> Memeriksa…
              </>
            ) : (
              "Cek Status"
            )}
          </button>
        </form>

        <div aria-live="polite">
          {tx ? (
            <section className="sp-card" style={{ marginTop: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <p className="f-hint" style={{ margin: 0 }}>
                    Produk
                  </p>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1B1B4B", marginTop: 4 }}>{tx.n}</h2>
                </div>
                <span className={`st ${ST[tx.s][1]}`}>{ST[tx.s][0]}</span>
              </div>

              <dl className="rs-grid">
                <div>
                  <dt>Nomor tujuan</dt>
                  <dd>{tx.t}</dd>
                </div>
                <div>
                  <dt>Nominal</dt>
                  <dd>{tx.p ? rp(tx.p) : "Sesuai tagihan"}</dd>
                </div>
                <div>
                  <dt>Tanggal</dt>
                  <dd>{fmtDate(tx.d)}</dd>
                </div>
                {tx.pm ? (
                  <div>
                    <dt>Metode pembayaran</dt>
                    <dd>{tx.pm}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>ID transaksi</dt>
                  <dd>
                    {tx.id}
                    <button
                      type="button"
                      className="cp"
                      onClick={() => copy(tx.id, setIdLabel, "Salin")}
                    >
                      {idLabel}
                    </button>
                  </dd>
                </div>
              </dl>

              {tx.token && tx.s === "success" ? (
                <div className="token">
                  <div>
                    <p className="f-hint" style={{ margin: "0 0 4px" }}>
                      Nomor token listrik
                    </p>
                    <b>{tx.token}</b>
                  </div>
                  <button
                    type="button"
                    className="btn-o"
                    onClick={() => copy(tx.token!.replace(/ /g, ""), setTokenLabel, "Salin Token")}
                  >
                    {tokenLabel}
                  </button>
                </div>
              ) : null}

              {tx.s === "failed" ? (
                <div className="refund">
                  <b>Dana kamu akan dikembalikan.</b> Refund otomatis diproses maks. 1×24 jam ke metode pembayaran
                  asal. Jika belum diterima, hubungi CS dengan menyebutkan ID transaksi.
                  <div style={{ marginTop: 16 }}>
                    <a
                      className="btn-p btn-wa"
                      style={{ height: 40 }}
                      target="_blank"
                      rel="noopener"
                      href={`https://wa.me/${site.waNumber}?text=${encodeURIComponent(
                        "Halo CS Aventiva, transaksi saya gagal. ID: " + tx.id,
                      )}`}
                    >
                      Hubungi CS
                    </a>
                  </div>
                </div>
              ) : null}

              {tx.s === "pending" ? (
                <p className="f-hint" style={{ marginTop: 16 }}>
                  Selesaikan pembayaran sebelum batas waktu agar pesanan diproses. (Mode pratinjau: belum ada
                  pembayaran nyata.)
                </p>
              ) : null}

              <h3 style={{ fontSize: 15, fontWeight: 700, marginTop: 32 }}>
                Riwayat status
              </h3>
              <Timeline tx={tx} />
            </section>
          ) : null}

          {missing ? (
            <section className="sp-card empty" style={{ marginTop: 24 }}>
              <svg width="120" height="96" viewBox="0 0 120 96" fill="none" aria-hidden="true">
                <rect x="20" y="8" width="64" height="80" rx="10" fill="#EEF0FF" />
                <path d="M34 28h36M34 42h36M34 56h20" stroke="#C7CBF5" strokeWidth="5" strokeLinecap="round" />
                <circle cx="80" cy="60" r="18" fill="#fff" stroke="#4338CA" strokeWidth="5" />
                <path d="m93 73 12 12" stroke="#4338CA" strokeWidth="6" strokeLinecap="round" />
                <path d="M74 54l12 12M86 54 74 66" stroke="#FDB022" strokeWidth="4" strokeLinecap="round" />
              </svg>
              <p>Transaksi tidak ditemukan. Periksa kembali ID kamu atau hubungi CS.</p>
              <a className="btn-o" style={{ marginTop: 16 }} href="/bantuan#kontak">
                Hubungi CS
              </a>
            </section>
          ) : null}
        </div>

        <Link href="/bantuan" className="help-box">
          <span>Butuh bantuan? Hubungi kami</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </>
  );
}

const STEP_NAMES = ["Pesanan dibuat", "Pembayaran diterima", "Diproses", "Selesai"];
const LEVEL: Record<Status, number> = { pending: 1, process: 2, success: 4, failed: 2, expired: 1 };

function Timeline({ tx }: { tx: Tx }) {
  const m = 10 * 6e4;
  const lv = LEVEL[tx.s];

  return (
    <ol className="tl">
      {STEP_NAMES.map((name, i) => {
        const done = i < lv;
        const fail = tx.s === "failed" && i === 2;
        const exp = tx.s === "expired" && i === 1;
        const label = fail ? "Gagal diproses" : exp ? "Pembayaran kedaluwarsa" : name;
        const time = done
          ? fmtDate(tx.d + (i * m) / 2)
          : fail
            ? fmtDate(tx.d + m)
            : exp
              ? fmtDate(tx.d + 24 * H)
              : "Menunggu";
        return (
          <li key={name} className={`${done ? "done" : ""}${fail || exp ? " fail" : ""}`}>
            <span className="dot">{done ? CHECK : fail || exp ? CROSS : ""}</span>
            <b>{label}</b>
            <span>{time}</span>
          </li>
        );
      })}
    </ol>
  );
}
