-- =====================================================================
--  Aventiva Digital — Metode Pembayaran
--  Jalankan SEKALI di: Dashboard Supabase → SQL Editor → New query → Run
--  Aman dijalankan ulang (IF NOT EXISTS / drop policy if exists / seed
--  hanya saat tabel masih kosong).
--
--  Ringkas:
--   1) tabel public.payment_methods (dikelola dari /admin)
--   2) hak akses: pengunjung hanya boleh membaca baris yang AKTIF
--   3) kolom fee pada tabel transactions (biaya metode per transaksi)
--   4) data awal: QRIS aktif, metode contoh lain NONAKTIF
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. TABEL METODE PEMBAYARAN
-- ---------------------------------------------------------------------
--   code        : penanda khusus (mis. 'qris') untuk metode bawaan sistem.
--                 NULL untuk metode buatan admin. Unik bila terisi.
--   grp         : nama grup bebas (QRIS, Virtual Account, E-Wallet, ...).
--   fee_type    : 'free' (gratis) | 'fixed' (nominal tetap) | 'percent' (%).
--   fee_value   : rupiah (fixed) atau angka persen (percent). 0 untuk gratis.
--   account_no  : nomor rekening / nomor Virtual Account.
--   account_name: nama pemilik rekening / VA.
--   instructions: instruksi pembayaran (teks bebas, boleh multiline).
--   logo        : URL logo opsional.
--   active      : hanya baris aktif yang tampil di checkout customer.
--   sort        : urutan tampil (naik) di dalam grupnya.

create table if not exists public.payment_methods (
  id           bigserial primary key,
  code         text unique,
  name         text    not null,
  grp          text    not null default '',
  descr        text    not null default '',
  fee_type     text    not null default 'free'
               check (fee_type in ('free','fixed','percent')),
  fee_value    integer not null default 0 check (fee_value >= 0),
  account_no   text    not null default '',
  account_name text    not null default '',
  instructions text    not null default '',
  logo         text,
  active       boolean not null default false,
  sort         integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists payment_methods_order_idx
  on public.payment_methods (grp, sort);

-- ---------------------------------------------------------------------
-- 2. HAK AKSES
--   Baca: pengunjung (anon) HANYA baris aktif — lihat policy di bagian 3.
--   Tulis: hanya kunci rahasia server (service_role) dari /admin.
-- ---------------------------------------------------------------------
grant select on public.payment_methods to anon, authenticated;
grant select, insert, update, delete on public.payment_methods to service_role;
grant usage, select on sequence public.payment_methods_id_seq to service_role;

-- ---------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------
alter table public.payment_methods enable row level security;

drop policy if exists "payments read active" on public.payment_methods;
create policy "payments read active"
  on public.payment_methods for select to anon, authenticated
  using (active = true);

-- ---------------------------------------------------------------------
-- 4. TRANSACTIONS — simpan jenis & biaya metode yang dipilih customer
-- ---------------------------------------------------------------------
alter table public.transactions
  add column if not exists fee integer not null default 0;

-- ---------------------------------------------------------------------
-- 5. DATA AWAL (hanya bila tabel masih kosong)
--   QRIS aktif & gratis (gambarnya tetap dari tab QRIS di /admin).
--   Sisanya NONAKTIF supaya customer tidak melihat metode yang belum
--   punya nomor rekening/VA asli — admin tinggal mengisi lalu mengaktifkan.
-- ---------------------------------------------------------------------
insert into public.payment_methods
  (code, name, grp, descr, fee_type, fee_value, account_no, account_name, instructions, active, sort)
select * from (
  values
    ('qris',  'QRIS',   'QRIS', 'Scan dari semua e-wallet & m-banking', 'free',    0, '', '', 'Buka aplikasi e-wallet / m-banking, pilih Scan QRIS, lalu scan kode di layar.', true,  0),
    (null,    'BCA',    'Virtual Account', 'Transfer via Virtual Account BCA',    'fixed', 1000, '', '', '', false, 10),
    (null,    'Mandiri','Virtual Account', 'Transfer via Virtual Account Mandiri','fixed', 1000, '', '', '', false, 11),
    (null,    'BNI',    'Virtual Account', 'Transfer via Virtual Account BNI',    'fixed', 1000, '', '', '', false, 12),
    (null,    'BRI',    'Virtual Account', 'Transfer via Virtual Account BRI',    'fixed', 1000, '', '', '', false, 13),
    (null,    'GoPay',  'E-Wallet', 'Bayar langsung dari aplikasi GoPay',   'free', 0, '', '', '', false, 20),
    (null,    'OVO',    'E-Wallet', 'Bayar langsung dari aplikasi OVO',     'free', 0, '', '', '', false, 21),
    (null,    'DANA',   'E-Wallet', 'Bayar langsung dari aplikasi DANA',    'free', 0, '', '', '', false, 22),
    (null,    'ShopeePay', 'E-Wallet', 'Bayar langsung dari aplikasi ShopeePay', 'free', 0, '', '', '', false, 23)
) as v(code, name, grp, descr, fee_type, fee_value, account_no, account_name, instructions, active, sort)
where not exists (select 1 from public.payment_methods);

-- =====================================================================
--  SELESAI. Setelah dijalankan:
--   1. Buka /admin → tab "Metode Pembayaran".
--   2. Isi nomor rekening/VA + nama pemilik tiap metode contoh, lalu
--      aktifkan yang mau tampil di checkout.
--   3. QRIS sudah aktif dan memakai gambar dari tab QRIS.
-- =====================================================================
