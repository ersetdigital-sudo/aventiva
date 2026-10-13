"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FEE, PAY } from "@/data/payments";
import { useCatalog } from "@/lib/catalog-context";
import { saveTransaction } from "@/lib/db";
import { rp } from "@/lib/format";
import { qrisUrl, supabaseEnabled } from "@/lib/supabase";
import type { Tx } from "@/lib/tx-types";
import { useShop } from "@/lib/shop-context";
type Step = "info" | "pay" | "done";
type Result = { ref: string; total: number; label: string; value: string; va: string };

const GROUPS = PAY.map((g) => ({
  title: g.group,
  options: g.subs
    ? g.subs.map(([label, value]) => ({ label, value, desc: "" }))
    : [{ label: g.group, value: g.value, desc: g.desc }],
}));

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
  const [method, setMethod] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [qrFailed, setQrFailed] = useState(false);
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
      setMethod("");
      setResult(null);
      setProcessing(false);
      setQrFailed(false);
    }
  }, [pending]);

  if (!cat || !item) return <dialog ref={dlg} aria-label="Pembelian" />;

  // salinan bertipe sempit untuk dipakai di dalam callback
  const category = cat;
  const product = item;

  const sub = item.bill ? 0 : item.p + cat.admin;
  const fee = method ? (FEE[method] ?? 0) : 0;
  const total = sub + fee;

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
    if (!method) {
      setErr("Pilih metode pembayaran dulu.");
      return;
    }
    setErr("");
    setProcessing(true);
    const label = GROUPS.flatMap((g) => g.options).find((o) => o.value === method)?.label ?? method;
    const catKey = pending!.cat;
    const digits = target.replace(/\D/g, "");
    setTimeout(() => {
      const ref = "AVD-" + Date.now().toString(36).toUpperCase();
      const paid = product.bill ? 0 : product.p + category.admin + (FEE[method] ?? 0);
      const tx: Tx = {
        id: ref,
        k: catKey,
        n: `${category.name} ${product.b} – ${product.n}`,
        t: digits,
        p: paid,
        d: Date.now(),
        s: "pending",
        pm: label,
      };
      saveTx(tx); // cadangan lokal (bila Supabase tidak terjangkau)
      void saveTransaction(tx); // tersimpan di database
      const va = method.startsWith("va-")
        ? "8808 " +
          String(Date.now())
            .slice(-10)
            .replace(/(\d{4})(\d{4})(\d{2})/, "$1 $2 $3")
        : "";
      setResult({ ref, total: paid, label, value: method, va });
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
            {GROUPS.map((g) => (
              <div key={g.title}>
                <div className="pm-g">{g.title}</div>
                {g.options.map((o) => (
                  <label key={o.value} className="pm">
                    <input
                      type="radio"
                      name="pm"
                      value={o.value}
                      checked={method === o.value}
                      onChange={() => {
                        setMethod(o.value);
                        setErr("");
                      }}
                    />
                    <span className="pm-b">
                      <b>{o.label}</b>
                      {o.desc ? <small>{o.desc}</small> : null}
                    </span>
                    <span className="pm-f">{(FEE[o.value] ?? 0) > 0 ? `+${rp(FEE[o.value])}` : "Gratis"}</span>
                  </label>
                ))}
              </div>
            ))}
          </fieldset>
          <div className="text-sm flex justify-between mt-4">
            <span className="text-slate-500">Harga + admin</span>
            <span>{item.bill ? "Sesuai tagihan" : rp(sub)}</span>
          </div>
          <div className="text-sm flex justify-between mt-1">
            <span className="text-slate-500">Biaya layanan pembayaran</span>
            <span>{method ? (fee ? rp(fee) : "Gratis") : "–"}</span>
          </div>
          <div className="flex justify-between mt-2 pt-2 border-t font-bold">
            <span>Total bayar</span>
            <span>{item.bill && !fee ? "Sesuai tagihan" : rp(total)}</span>
          </div>
          <p className="text-sm text-red-600 mt-2" role="alert">
            {err}
          </p>
          <button className="btn-primary w-full mt-3" disabled={processing}>
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
  const qrReady = supabaseEnabled && !qrFailed;
  const how =
    result?.value === "qris" ? (
      <>
        {qrReady ? (
          <div className="mx-auto" style={{ width: 208, height: 208 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrisUrl()}
              alt="Kode QRIS Aventiva Digital"
              width={208}
              height={208}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              onError={() => setQrFailed(true)}
            />
          </div>
        ) : (
          <div className="pm-qr" aria-label="Kode QR contoh">
            {Array.from({ length: 49 }, (_, j) => (
              <i key={j} style={{ background: (j * 7 + (j % 3)) % 3 ? "#1B1B4B" : "#fff" }} />
            ))}
          </div>
        )}
        <p className="text-sm text-slate-500 mt-2">Scan QRIS ini dengan aplikasi e-wallet atau m-banking.</p>
      </>
    ) : result?.va ? (
      <>
        <p className="text-sm text-slate-500">Nomor Virtual Account {result.label}</p>
        <p className="font-mono font-bold text-xl mt-1">{result.va}</p>
      </>
    ) : (
      <p className="text-sm text-slate-500">
        Kamu akan diarahkan ke aplikasi {result?.label} untuk menyelesaikan pembayaran.
      </p>
    );

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
