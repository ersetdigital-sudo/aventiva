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
    <div className="mx-auto w-full max-w-[420px]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
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
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Masuk Panel Admin</h1>
          <p className="mt-1 text-sm text-slate-500">
            Panel internal untuk mengelola produk, harga, dan transaksi.
          </p>
        </div>

        <form onSubmit={submit} className="mt-6" noValidate>
          <label className="block text-sm font-medium text-slate-700" htmlFor="admin-pass">
            Kata sandi
          </label>
          <input
            id="admin-pass"
            className="inp"
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
          <p id="admin-pass-err" role="alert" className="mt-2 min-h-[20px] text-sm text-red-600">
            {error}
          </p>
          <button type="submit" className="btn-primary w-full disabled:opacity-60" disabled={busy || !password}>
            {busy ? "Memeriksa…" : "Masuk"}
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-500">
          Kata sandi ini adalah nilai <b>ADMIN_KEY</b> di server. Sesi berlaku 8 jam.
        </p>
      </div>
    </div>
  );
}
