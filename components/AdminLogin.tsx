"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Form masuk panel admin — satu kata sandi (ADMIN_KEY di server). */
export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        router.replace("/admin");
        router.refresh();
        return;
      }
      setError(data.error ?? "Tidak bisa masuk.");
    } catch {
      setError("Gagal menghubungi server. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-[440px]">
      <section className="sp-card" aria-labelledby="admin-login-title">
        <div className="flex flex-col items-center text-center">
          <span
            aria-hidden="true"
            className="grid h-14 w-14 place-items-center rounded-2xl bg-[color:var(--soft)] text-[color:var(--brand)]"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="10" width="16" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </span>
          <h1
            id="admin-login-title"
            className="text-[25px] leading-tight font-extrabold tracking-[-.01em] text-[color:var(--brand-d)]"
            style={{ marginTop: 16 }}
          >
            Masuk Panel Admin
          </h1>
          <p className="text-sm text-slate-500" style={{ marginTop: 8, maxWidth: "34ch" }}>
            Panel internal untuk mengelola produk, harga, dan transaksi.
          </p>
        </div>

        <form onSubmit={submit} style={{ marginTop: 28 }} noValidate>
          <label className="f-lbl" htmlFor="admin-pass">
            Kata sandi
          </label>
          <div className="f-field">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="7.5" cy="15.5" r="4" />
              <path d="m10.5 12.5 8.5-8.5M16.5 6.5l2 2M14 9l2 2" />
            </svg>
            <input
              id="admin-pass"
              className="f-inp"
              type="password"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              placeholder="Masukkan kata sandi admin"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "admin-pass-err" : undefined}
            />
          </div>
          <p id="admin-pass-err" role="alert" className="f-err">
            {error}
          </p>
          <button
            type="submit"
            className="btn-p"
            style={{ width: "100%", marginTop: 16 }}
            disabled={busy || !password}
          >
            {busy ? (
              <>
                <span className="spin" aria-hidden="true" /> Memeriksa…
              </>
            ) : (
              "Masuk"
            )}
          </button>
        </form>

        <p className="f-hint" style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #F1F1F5" }}>
          Kata sandi ini adalah nilai <b>ADMIN_KEY</b> di server. Sesi berlaku 8 jam.
        </p>
      </section>
    </div>
  );
}
