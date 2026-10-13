-- =====================================================================
--  Aventiva Digital — Skema Supabase
--  Jalankan SEKALI di: Dashboard Supabase → SQL Editor → New query → Run
--  Aman dijalankan ulang (semua perintah memakai IF NOT EXISTS / ON CONFLICT).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. TABEL
-- ---------------------------------------------------------------------

-- Kategori produk (pulsa, paket data, token PLN, …)
create table if not exists public.categories (
  key     text primary key,
  name    text        not null,
  ico     text        not null default 'phone',
  label   text        not null default 'Nomor HP',
  admin   integer     not null default 0,
  filters text[]      not null default '{}',
  sort    integer     not null default 0
);

-- Produk di dalam kategori
create table if not exists public.products (
  id      bigserial primary key,
  cat_key text    not null,
  n       text    not null,             -- nama produk
  b       text    not null default '',  -- brand / penyedia
  f       text    not null default '',  -- filter (sub-kategori)
  d       text    not null default '',  -- keterangan singkat
  p       integer not null default 0,   -- harga jual
  o       integer,                      -- harga coret
  bill    boolean not null default false,
  soldout boolean not null default false,
  sort    integer not null default 0
);

-- FAQ pusat bantuan (a boleh berisi HTML ringan)
create table if not exists public.faqs (
  id   bigserial primary key,
  cat  text not null,   -- cara | bayar | masalah | akun
  q    text not null,
  a    text not null,
  sort integer not null default 0
);

-- Pengaturan situs (key/value) — ubah nilai langsung dari Table Editor
create table if not exists public.site_settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

-- Transaksi checkout
create table if not exists public.transactions (
  id             text primary key,                       -- AVD-XXXXXXXX
  cat_key        text,
  name           text not null,                          -- label produk
  target         text not null,                          -- nomor tujuan
  amount         integer not null default 0,
  status         text not null default 'pending'
                 check (status in ('pending','process','success','failed','expired')),
  payment_method text,
  token          text,
  created_at     timestamptz not null default now(),
  expires_at     timestamptz
);

create index if not exists products_cat_idx     on public.products (cat_key, sort);
create index if not exists faqs_sort_idx        on public.faqs (sort);
create index if not exists tx_target_idx        on public.transactions (target);
create index if not exists tx_created_idx       on public.transactions (created_at desc);

-- ---------------------------------------------------------------------
-- 2. EXPOSE KE DATA API (wajib!)
--    Mulai 30 Okt 2026 tabel BARU tidak otomatis ter-expose ke REST API,
--    jadi GRANT-nya harus eksplisit seperti di bawah ini.
-- ---------------------------------------------------------------------

grant usage on schema public to anon, authenticated, service_role;

grant select on public.categories, public.products, public.faqs, public.site_settings
  to anon, authenticated, service_role;

-- katalog/FAQ/pengaturan hanya boleh DIBACA lewat API;
-- perubahan dilakukan lewat Dashboard / tombol Sinkron di /admin.

grant select, insert, update, delete on public.transactions
  to anon, authenticated, service_role;

-- ---------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------

alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.faqs           enable row level security;
alter table public.site_settings  enable row level security;
alter table public.transactions   enable row level security;

-- baca publik
drop policy if exists "public read categories"    on public.categories;
drop policy if exists "public read products"      on public.products;
drop policy if exists "public read faqs"          on public.faqs;
drop policy if exists "public read site_settings" on public.site_settings;

create policy "public read categories"
  on public.categories for select to anon, authenticated using (true);

create policy "public read products"
  on public.products for select to anon, authenticated using (true);

create policy "public read faqs"
  on public.faqs for select to anon, authenticated using (true);

create policy "public read site_settings"
  on public.site_settings for select to anon, authenticated using (true);

-- transaksi: siapa pun boleh menulis & membaca (mode pratinjau, tanpa login).
-- >> SEBELUM PRODUKSI: ganti dengan kebijakan berbasis auth.uid()  <<
drop policy if exists "tx insert" on public.transactions;
drop policy if exists "tx select" on public.transactions;
drop policy if exists "tx update" on public.transactions;

create policy "tx insert"
  on public.transactions for insert to anon, authenticated
  with check (true);

create policy "tx select"
  on public.transactions for select to anon, authenticated
  using (true);

-- diperlukan supaya update status (mis. dari panel admin) tidak diam-diam gagal
create policy "tx update"
  on public.transactions for update to anon, authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------
-- 4. STORAGE — bucket buat gambar QRIS
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('assets', 'assets', true)
on conflict (id) do update set public = true;

drop policy if exists "assets public read" on storage.objects;
create policy "assets public read"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'assets');

-- upload & ganti HANYA boleh untuk qris.png (dijalankan lewat /admin)
drop policy if exists "assets insert qris" on storage.objects;
create policy "assets insert qris"
  on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'assets' and name = 'qris.png');

drop policy if exists "assets update qris" on storage.objects;
create policy "assets update qris"
  on storage.objects for update to anon, authenticated
  using (bucket_id = 'assets' and name = 'qris.png')
  with check (bucket_id = 'assets' and name = 'qris.png');

-- ---------------------------------------------------------------------
-- 5. SEED pengaturan situs + transaksi contoh
-- ---------------------------------------------------------------------

insert into public.site_settings (key, value) values
  ('name',              'Aventiva Digital'),
  ('tagline',           'Digital transactions. Simplified.'),
  ('url',               'https://aventivadigital.net'),
  ('wa_number',         '6281200000000'),
  ('wa_display',        '+62 812-0000-0000'),
  ('email',             'cs@aventivadigital.net'),
  ('hours',             'Setiap hari, 08.00–22.00 WIB'),
  ('hours_note',        'Transaksi otomatis tetap berjalan 24/7'),
  ('description',       'Platform pembelian pulsa, paket data, token PLN, e-wallet, dan pembayaran tagihan dengan harga jelas dan proses otomatis.'),
  ('social_instagram',  '#'),
  ('social_facebook',   '#'),
  ('social_tiktok',     '#')
on conflict (key) do nothing;

-- ID transaksi contoh supaya halaman Cek Transaksi langsung ada datanya
insert into public.transactions (id, cat_key, name, target, amount, status, payment_method, token, created_at) values
  ('AVD-DEMO1','pln','Token PLN Token 100.000','14012345678',102500,'success','QRIS','4821 0937 5512 6604 1188', now() - interval '2 hours'),
  ('AVD-DEMO2','pulsa','Pulsa Telkomsel Pulsa 50.000','081234567890',51500,'process','BCA',null, now() - interval '20 minutes'),
  ('AVD-DEMO3','data','Paket Data XL Kuota 10 GB','087812345678',65000,'failed','QRIS',null, now() - interval '26 hours'),
  ('AVD-DEMO4','ewallet','E-Wallet DANA Saldo 100.000','085712345678',101000,'pending','GoPay',null, now() - interval '6 minutes'),
  ('AVD-DEMO5','pulsa','Pulsa Indosat Pulsa 25.000','085612345678',26750,'expired','OVO',null, now() - interval '72 hours')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- 6. (Opsional) hentikan GRANT otomatis untuk tabel baru
--     Supaya tabel yang kamu buat nanti tidak langsung terekspos ke API.
-- ---------------------------------------------------------------------
alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke execute on functions from anon, authenticated, service_role;

-- =====================================================================
--  SELESAI. Setelah ini:
--   1. Buka /admin → tekan "Sinkronkan katalog & FAQ" (mengisi tabel
--      categories, products, faqs dari data statis).
--   2. Upload gambar QRIS di halaman yang sama.
--   3. Buka /cek-transaksi → coba AVD-DEMO1 (datanya dari database).
-- =====================================================================
