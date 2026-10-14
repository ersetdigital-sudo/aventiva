"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCatalog } from "@/lib/catalog-context";
import { saveTransaction } from "@/lib/db";
import { rp } from "@/lib/format";
import { Icon } from "@/lib/icons";
import {
  FALLBACK_METHODS,
  feeLabel,
  feeOf,
  groupMethods,
  isQris,
  type PaymentMethod,
} from "@/lib/payment-types";
import { getSupabase, loadQris } from "@/lib/supabase";
import type { Tx } from "@/lib/tx-types";
import { useShop } from "@/lib/shop-context";
type Step = "info" | "pay" | "done";
type QrPhase = "loading" | "ready" | "error";
type Result = { ref: string; total: number; fee: number; method: PaymentMethod };

const METHOD_COLUMNS =
  "id, code, name, grp, descr, fee_type, fee_value, account_no, account_name, instructions, logo, active, sort";

function saveTx(tx: Record<string, unknown>) {
  try {
    const list = JSON.parse(localStorage.getItem("avd_tx") || "[]") as Record<string, unknown>[];
    list.unshift(tx);
    localStorage.setItem("avd_tx", JSON.stringify(list.slice(0, 20)));
  } catch {
    /* storage penuh / non-aktif — abaikan */
  }
}

/** Dialog pembelian multi-langkah: data tujuan → metode bayar → instruksi bayar. */
export function BuyDialog() {
  const { pending, close } = useShop();
  const dlg = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<Step>("info");
  const [target, setTarget] = useState("");
  const [err, setErr] = useState("");
  const [methods, setMethods] = useState<PaymentMethod[] | null>(null);
  const [methodId, setMethodId] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);
  // status gambar QRIS di langkah terakhir: memuat → siap → gagal
  const [qrPhase, setQrPhase] = useState<QrPhase>("loading");
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [qrTry, setQrTry] = useState(0); // dinaikkan saat tombol "Coba lagi" ditekan
  const CATS = useCatalog();

  const cat = pending ? CATS[pending.cat] : null;
  const item = pending && cat ? cat.items[pending.idx] : null;

  // sinkronkan state React dengan elemen <dialog> asli
  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (pending && !d.open) d.showModal();
    if (!pending && d.open) d.close();
  }, [pending]);

  useEffect(() => {
    if (pending) {
      setStep("info");
      setTarget("");
      setErr("");
      setMethodId(null);
      setResult(null);
      setProcessing(false);
      setCopied(false);
      setQrPhase("loading");
      setQrSrc(null);
    }
  }, [pending]);

  // muat metode pembayaran aktif dari database saat dialog dibuka
  useEffect(() => {
    if (!pending) return;
    let alive = true;
    setMethods(null);
    const sb = getSupabase();
    if (!sb) {
      setMethods(FALLBACK_METHODS);
      return;
    }
    void (async () => {
      const { data, error } = await sb
        .from("payment_methods")
        .select(METHOD_COLUMNS)
        .eq("active", true)
        .order("sort", { ascending: true })
        .order("id", { ascending: true });
      if (!alive) return;
      // tabel belum dibuat / koneksi gagal → tetap tampilkan QRIS agar checkout jalan
      setMethods(error ? FALLBACK_METHODS : ((data ?? []) as PaymentMethod[]));
    })();
    return () => {
      alive = false;
    };
  }, [pending]);

  // ambil URL QRIS + versinya saat langkah pembayaran QRIS selesai
  useEffect(() => {
    if (step !== "done" || !result || !isQris(result.method)) return;
    let alive = true;
    setQrPhase("loading");
    setQrSrc(null);
    void loadQris().then((q) => {
      if (!alive) return;
      if (!q.ok) {
        setQrPhase("error");
        return;
      }
      setQrSrc(q.url);
    });
    return () => {
      alive = false;
    };
  }, [step, result, qrTry]);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard tidak tersedia — abaikan */
    }
  }, []);

  if (!cat || !item) return <dialog ref={dlg} aria-label="Pembelian" />;

  // salinan bertipe sempit untuk dipakai di dalam callback
  const category = cat;
  const product = item;

  const sub = item.bill ? 0 : item.p + cat.admin;
  const sel = methods?.find((m) => m.id === methodId) ?? null;
  const fee = sel ? feeOf(sel, sub) : 0;
  const total = sub + fee;
  const groups = groupMethods(methods ?? []);
  const noMethods = methods !== null && methods.length === 0;

  function submitInfo(e: React.FormEvent) {
    e.preventDefault();
    const digits = target.replace(/\D/g, "");
    if (digits.length < 8) {
      setErr("Nomor minimal 8 digit.");
      return;
    }
    setErr("");
    setStep("pay");
  }

  function submitPay(e: React.FormEvent) {
    e.preventDefault();
    if (!sel) {
      setErr("Pilih metode pembayaran dulu.");
      return;
    }
    setErr("");
    setProcessing(true);
    const chosen = sel;
    const catKey = pending!.cat;
    const digits = target.replace(/\D/g, "");
    setTimeout(() => {
      const ref = "AVD-" + Date.now().toString(36).toUpperCase();
      const methodFee = feeOf(chosen, product.bill ? 0 : product.p + category.admin);
      const paid = product.bill ? 0 : product.p + category.admin + methodFee;
      const tx: Tx = {
        id: ref,
        k: catKey,
        n: `${category.name} ${product.b} – ${product.n}`,
        t: digits,
        p: paid,
        d: Date.now(),
        s: "pending",
        pm: chosen.name,
        fee: methodFee,
      };
      saveTx(tx); // cadangan lokal (bila Supabase tidak terjangkau)
      void saveTransaction(tx); // tersimpan di database
      setResult({ ref, total: paid, fee: methodFee, method: chosen });
      setProcessing(false);
      setStep("done");
    }, 600);
  }

  const closeBtn = (
    <button type="button" onClick={close} className="text-2xl leading-none" aria-label="Tutup">
      ×
    </button>
  );

  if (step === "info") {
    return (
      <dialog ref={dlg} aria-label="Beli produk" onClose={close}>
        <form onSubmit={submitInfo} className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-slate-500">{item.b}</div>
              <h3 className="text-xl font-bold">
                {cat.name} — {item.n}
              </h3>
            </div>
            {closeBtn}
          </div>
          <label className="block mt-5 text-sm font-medium" htmlFor="tgt">
            {cat.label}
          </label>
          <input
            id="tgt"
            className="inp"
            inputMode="numeric"
            autoComplete="off"
            placeholder={`Masukkan ${cat.label.toLowerCase()}`}
            value={target}
            onChange={(e) => {
              setTarget(e.target.value);
              if (err) setErr("");
            }}
          />
          <div className="mt-4 text-sm flex justify-between">
            <span className="text-slate-500">Harga</span>
            <span>{item.bill ? "Dicek saat bayar" : rp(item.p)}</span>
          </div>
          <div className="text-sm flex justify-between mt-1">
            <span className="text-slate-500">Biaya admin</span>
            <span>{rp(cat.admin)}</span>
          </div>
          <div className="text-sm flex justify-between mt-2 pt-2 border-t font-bold">
            <span>Total</span>
            <span>{item.bill ? "Sesuai tagihan" : rp(item.p + cat.admin)}</span>
          </div>
          <p className="text-sm text-red-600 mt-2" role="alert">
            {err}
          </p>
          <button className="btn-primary w-full mt-3">Lanjut ke Pembayaran</button>
        </form>
      </dialog>
    );
  }

  if (step === "pay") {
    return (
      <dialog ref={dlg} aria-label="Pilih metode pembayaran" onClose={close}>
        <form onSubmit={submitPay} className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <button
                type="button"
                className="text-sm font-semibold text-indigo-700"
                onClick={() => setStep("info")}
              >
                ← Ubah nomor
              </button>
              <h3 className="text-xl font-bold mt-1">Pilih Metode Pembayaran</h3>
            </div>
            {closeBtn}
          </div>
          <div className="pm-sum">
            <span>
              {cat.name} {item.b} – {item.n}
            </span>
            <span>Tujuan: {target}</span>
          </div>
          <fieldset className="pm-list">
            <legend className="sr-only">Metode pembayaran</legend>
            {methods === null ? (
              Array.from({ length: 3 }, (_, i) => (
                <span key={i} className="sk pm-skel" aria-hidden="true" />
              ))
            ) : noMethods ? (
              <p className="pm-empty">Metode pembayaran belum tersedia.</p>
            ) : (
              groups.map((g) => (
                <div key={g.grp}>
                  <div className="pm-g">{g.grp}</div>
                  {g.items.map((m) => (
                    <label key={m.id} className="pm">
                      <input
                        type="radio"
                        name="pm"
                        value={m.id}
                        checked={methodId === m.id}
                        onChange={() => {
                          setMethodId(m.id);
                          setErr("");
                        }}
                      />
                      <span className="pm-b">
                        <b>{m.name}</b>
                        {m.descr ? <small>{m.descr}</small> : null}
                      </span>
                      <span className="pm-f">{feeLabel(m, sub)}</span>
                    </label>
                  ))}
                </div>
              ))
            )}
          </fieldset>
          <div className="text-sm flex justify-between mt-4">
            <span className="text-slate-500">Harga + admin</span>
            <span>{item.bill ? "Sesuai tagihan" : rp(sub)}</span>
          </div>
          <div className="text-sm flex justify-between mt-1">
            <span className="text-slate-500">Biaya layanan pembayaran</span>
            <span>{sel ? (fee ? rp(fee) : "Gratis") : "–"}</span>
          </div>
          <div className="flex justify-between mt-2 pt-2 border-t font-bold">
            <span>Total bayar</span>
            <span>{item.bill && !fee ? "Sesuai tagihan" : rp(total)}</span>
          </div>
          <p className="text-sm text-red-600 mt-2" role="alert">
            {err}
          </p>
          <button className="btn-primary w-full mt-3" disabled={processing || noMethods || !sel}>
            {processing ? (
              <>
                <span className="spin" aria-hidden="true" /> Memproses…
              </>
            ) : (
              "Bayar Sekarang"
            )}
          </button>
        </form>
      </dialog>
    );
  }

  // step: done
  const m = result?.method ?? null;
  const isQr = m ? isQris(m) : false;

  const qrBlock =
    qrPhase === "error" ? (
      <div className="qr-fail" role="alert">
        <Icon name="alert" width={26} height={26} />
        <p>QRIS belum tersedia, hubungi admin</p>
        <button type="button" className="btn-o" onClick={() => setQrTry((n) => n + 1)}>
          Coba lagi
        </button>
      </div>
    ) : (
      <div className="qr-frame">
        {qrSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={`qr-img${qrPhase === "ready" ? " is-ready" : ""}`}
            src={qrSrc}
            alt="Kode QRIS Aventiva Digital"
            onLoad={(e) => {
              const el = e.currentTarget;
              // gambar terlalu kecil / placeholder (mis. 1×1) dianggap belum tersedia
              if (el.naturalWidth < 64 || el.naturalHeight < 64) setQrPhase("error");
              else setQrPhase("ready");
            }}
            onError={() => setQrPhase("error")}
          />
        ) : null}
        {qrPhase !== "ready" ? <span className="qr-skel" aria-hidden="true" /> : null}
      </div>
    );

  const how = isQr ? (
    <>
      {qrBlock}
      {qrPhase !== "error" ? (
        <p className="text-sm text-slate-500 mt-2">
          Scan QRIS ini dengan aplikasi e-wallet atau m-banking.
        </p>
      ) : null}
    </>
  ) : m ? (
    <>
      <p className="text-sm text-slate-500">
        Bayar via <b>{m.name}</b>
      </p>
      <div className="pay-box">
        <span className="pay-lbl">Nomor rekening / Virtual Account</span>
        <div className="pay-no">
          <span className="pay-val">{m.account_no || "—"}</span>
          {m.account_no ? (
            <button type="button" className="cp" onClick={() => void copy(m.account_no)}>
              {copied ? "Tersalin" : "Salin"}
            </button>
          ) : null}
        </div>
        <span className="pay-lbl">Nama pemilik</span>
        <span className="pay-owner">{m.account_name || "—"}</span>
      </div>
      {m.instructions ? <p className="pay-inst">{m.instructions}</p> : null}
    </>
  ) : null;

  return (
    <dialog ref={dlg} aria-label="Selesaikan pembayaran" onClose={close}>
      <div className="p-8 text-center">
        <h3 className="text-2xl font-bold">Selesaikan Pembayaran</h3>
        <p className="text-slate-500 mt-1">
          Total <b className="text-[color:var(--brand-d)]">{result?.total ? rp(result.total) : "sesuai tagihan"}</b> ·
          bayar sebelum{" "}
          <b>
            {new Date(Date.now() + 864e5).toLocaleString("id-ID", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </b>
        </p>
        <div className="mt-5">{how}</div>
        <p className="text-slate-500 mt-5 text-sm">ID transaksi</p>
        <p className="font-mono font-bold text-lg">{result?.ref}</p>
        <p className="text-xs text-slate-500 mt-3">Mode pratinjau: tidak ada pembayaran nyata yang diproses.</p>
        <Link className="btn-primary w-full mt-5 inline-block" href={`/cek-transaksi?id=${result?.ref}`}>
          Cek Status
        </Link>
        <button type="button" className="w-full mt-3 text-sm font-semibold text-slate-600" onClick={close}>
          Tutup
        </button>
      </div>
    </dialog>
  );
}
