# Aventiva Digital — Next.js

Konversi situs HTML statis (folder `pages/`, `assets/`, `fonts/`, `images/` — arsip lengkap ada di `_original/`) menjadi **Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Framer Motion**.

## Menjalankan

```bash
npm install
npm run dev    # development → http://localhost:3000
npm run build  # build produksi
npm run start  # jalankan hasil build
```

## Struktur

```
app/                  # route (App Router)
  layout.tsx          # shell global: font, header, footer, metadata, JSON-LD
  page.tsx            # beranda
  layanan/            # katalog produk (?c=kategori & ?q=pencarian)
  cek-transaksi/      # cek status transaksi (?id=AVD-…)
  bantuan/            # pusat bantuan + FAQ (?k=kategori)
  sitemap.ts robots.ts opengraph-image.tsx icon.svg
  globals.css         # Tailwind + style asli (theme.css)
components/           # Header, Footer, ProductCard, BuyDialog, AdminPanel, dll.
data/                 # data statis: kategori, FAQ, pembayaran, kontak (fallback)
lib/                  # helper: ikon, format, context, koneksi Supabase (db.ts)
supabase/             # schema.sql (jalankan dulu) + seed.sql (katalog & FAQ)
scripts/gen-seed.ts   # generator supabase/seed.sql dari data/ → jalankan ulang bila data berubah
app/admin/            # panel internal: upload gambar QRIS + status koneksi
public/               # fonts/ (Plus Jakarta Sans) dan images/
_original/            # versi HTML statis asli (arsip, tidak ikut dibuild)
```

## Koneksi Supabase

Aplikasi menyambung ke Supabase (database + storage). Semua fitur punya **fallback**,
jadi situs tetap jalan walaupun Supabase belum disetel — sumber data berubah menjadi
Supabase begitu langkah di bawah selesai.

1. **Salin env**: `cp .env.example .env.local` lalu isi `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (kunci `sbp_…`), dan `ADMIN_KEY`.
2. **Jalankan skema**: buka Dashboard → SQL Editor → tempel isi `supabase/schema.sql` → Run.
   (Membuat tabel, GRANT ke Data API, RLS, bucket Storage `assets`, dan transaksi contoh.)
3. **Jalankan seed**: tempel isi `supabase/seed.sql` → Run (kategori, produk, FAQ).
4. **Upload QRIS**: buka `http://localhost:3000/admin` → isi kunci admin → pilih gambar →
   Upload. Gambar tersimpan di Storage sebagai `assets/qris.png` dan otomatis tampil di
   dialog pembayaran.
5. **Uji**: buka `/cek-transaksi` → coba `AVD-DEMO1` (data dari tabel `transactions`).

Setelah katalog ada di database, edit produk/FAQ/pengaturan lewat **Table Editor**
Supabase. Bila data `data/` diubah, regenerate seed dengan
`node scripts/gen-seed.ts > supabase\seed.sql`.

Tabel Supabase → konsumen di aplikasi:

| Tabel             | Fungsi                              | Dibaca oleh                       |
| ----------------- | ----------------------------------- | --------------------------------- |
| `categories` + `products` | katalog & harga             | beranda, `/layanan`, dialog beli  |
| `faqs`            | pusat bantuan                       | `/bantuan` (+ JSON-LD FAQ)        |
| `site_settings`   | WA, email, jam CS, sosial           | header/footer/kontak              |
| `transactions`    | checkout & cek transaksi            | BuyDialog, `/cek-transaksi`       |
| Storage `assets`  | gambar QRIS                         | dialog pembayaran, `/admin`       |

## Yang perlu diisi manual

- **Nomor WhatsApp & email CS** → tabel `site_settings` (atau `data/site.ts` sebagai fallback)
- **Domain canonical / sitemap** → `SITE.url` di `data/site.ts`
- **Link "Tentang Kami", "Syarat & Ketentuan", "Kebijakan Privasi"** → masih `#`, ada di `data/site.ts` (`FOOTER_COLS`)
- **Produk & harga** → tabel `categories` / `products`, atau `data/categories.ts` lalu regenerate `seed.sql`
- **FAQ** → tabel `faqs`, atau `data/faq.ts` lalu regenerate `seed.sql`

## Catatan

- Checkout masih **mode pratinjau**: transaksi disimpan ke tabel `transactions` (Supabase) dan
  dicadangkan di `localStorage` (`avd_tx`) → bisa dicek di halaman Cek Transaksi.
  Belum terhubung payment gateway.
- RLS `transactions` masih mengizinkan baca/tulis anon (demo tanpa login). **Sebelum produksi,
  ganti kebijakan berbasis `auth.uid()`** — catatan ada di `supabase/schema.sql`.
- Route dibuat `force-dynamic` supaya pencarian/filter (`useSearchParams`) ter-render utuh di HTML untuk SEO.
