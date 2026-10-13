<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Menjalankan di sandbox Base44

```bash
docker compose -f docker-compose.base44.yml up -d --build   # build + start
docker compose -f docker-compose.base44.yml logs -f web     # log dev server
docker compose -f docker-compose.base44.yml ps              # status + healthcheck
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/
```

Catatan setup (hal yang tidak terlihat dari manifest):

- **Sumber di-bind mount, bukan di-bake.** `Dockerfile.base44` hanya `npm ci` dari
  `package.json` + `package-lock.json`; kode aplikasi masuk lewat volume `./:/app`.
  Jangan pernah menambah `COPY . .` — itu membekukan kode dan membuat edit tidak terlihat.
- **`node_modules` ada di named volume**, terisi dari image saat pertama dibuat. Perintah
  start menjalankan `npm install --prefer-offline` (cepat/no-op bila sudah cocok) lalu
  `next dev -H 0.0.0.0 -p 3000`. Kalau `package-lock.json` berubah: `up -d --build`.
- **Tanpa Supabase, aplikasi tetap jalan penuh.** `lib/supabase.ts` menganggap Supabase
  aktif hanya bila `NEXT_PUBLIC_SUPABASE_URL` **dan** `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  terisi. Kalau kosong: katalog & FAQ dari `data/`, transaksi demo (`AVD-DEMO1..5`) di
  `components/CekTransaksiView.tsx`, checkout jatuh ke `localStorage` (`avd_tx`).
  Yang tidak berfungsi dalam mode ini hanya panel `/admin` (upload QRIS ke Storage) dan
  sumber data dari tabel Supabase.
- **Urutan env**: `.env.base44-defaults` (placeholder, urutan pertama) lalu
  `/run/base44/app.env` (secret platform, selalu menang). Jangan taruh kredensial
  Supabase di `environment:` compose — itu akan menimpa nilai dari dashboard selamanya.
- **`next.config.ts` punya `allowedDevOrigins`** yang hanya aktif bila
  `BASE44_PREVIEW_MODE === "1"` dan `BASE44_PUBLIC_HOST_SUFFIX` terisi; entri-nya
  `3000-<suffix>` (hostname tanpa skema/port). Dengan env kosong, perilakunya seperti
  semula (localhost saja). HMR diaktifkan lewat `WATCHPACK_POLLING=true`.
- **Verifikasi**: healthcheck compose memakai `fetch('http://127.0.0.1:3000/')` (Node 22
  sudah punya `fetch`; image slim tidak punya curl/wget).

## Panel admin (`/admin`)

- **Satu kata sandi.** Login di `/admin/login` memakai nilai `ADMIN_KEY`. Sesi = cookie
  httpOnly `avd_admin` berisi HMAC-SHA256 dari `ADMIN_KEY` (`lib/admin-auth.ts`), berlaku
  8 jam. Karena turunan dari ADMIN_KEY, mengganti ADMIN_KEY otomatis membatalkan sesi lama.
  `/admin` redirect ke `/admin/login` bila cookie tidak valid; keluar lewat
  `POST /api/admin/logout`.
- **Menulis hanya lewat kunci rahasia server.** Semua route `/api/admin/*` memakai
  `createAdminSupabase()` (`lib/supabase-admin.ts`, env `SUPABASE_SECRET_KEY` = kunci
  `sb_secret_…`) sebab kunci publishable tidak boleh menulis ke tabel katalog (RLS hanya
  memberi GRANT select). Tanpa kunci rahasia dashboard jatuh ke mode baca dan UI-nya
  memberi tahu.
- **Setelah produk diubah**, route memanggil `revalidate()` (`lib/db.ts`) supaya cache
  katalog 30 detik di situs langsung bersih.
- **Route**: `login` · `logout` · `overview` (jumlah baris + statistik transaksi) ·
  `products` (GET/POST) · `products/[id]` (PATCH/DELETE) · `transactions` (GET, parameter
  `status` & `q`) · `transactions/[id]` (PATCH status) · `qris` (upload; otorisasi via
  cookie sesi atau field `key`).
- Aplikasi ini tidak punya akun pengguna, jadi "aktivitas" = baris tabel `transactions`.

