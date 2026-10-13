-- ====================================================================
--  Aventiva Digital — SEED katalog, FAQ, dan pengaturan situs
--  DIBUAT OTOMATIS oleh scripts/gen-seed.ts — jangan edit manual,
--  jalankan ulang skrip itu bila data di data/ berubah.
--  Jalankan di: Dashboard Supabase → SQL Editor (setelah schema.sql)
--
--  Catatan: skema & seed ini SUDAH dijalankan ke project
--  yklalpnucoorjmgpiocr pada 2026-10-13. File ini disimpan sebagai
--  referensi / untuk deploy ulang ke project lain.
-- ====================================================================

begin;

truncate public.categories, public.products, public.faqs restart identity;

-- kategori
insert into public.categories (key, name, ico, label, admin, filters, sort) values
  ('pulsa', 'Pulsa', 'phone', 'Nomor HP', 0, array['Telkomsel','Indosat','XL','Tri','Smartfren']::text[], 0),
  ('data', 'Paket Data', 'signal', 'Nomor HP', 0, array['Telkomsel','Indosat','XL','Tri']::text[], 1),
  ('pln', 'Token PLN', 'zap', 'No. Meter / ID Pelanggan', 2500, array['Token','Tagihan']::text[], 2),
  ('ewallet', 'E-Wallet', 'wallet', 'Nomor Akun', 1000, array['GoPay','OVO','DANA','ShopeePay']::text[], 3),
  ('internet', 'Internet', 'globe', 'ID Pelanggan', 2500, array['IndiHome','Biznet','MyRepublic','First Media']::text[], 4),
  ('bpjs', 'BPJS', 'shield', 'Nomor VA', 2500, array['Kesehatan','Ketenagakerjaan']::text[], 5),
  ('pdam', 'PDAM', 'drop', 'ID Pelanggan', 2500, array['Jawa','Sumatra','Kalimantan','Sulawesi']::text[], 6),
  ('finance', 'Multifinance', 'car', 'Nomor Kontrak', 5000, array['Motor','Mobil','Elektronik']::text[], 7);

-- produk
insert into public.products (cat_key, n, b, f, d, p, o, bill, soldout, sort) values
  ('pulsa', 'Pulsa 5.000', 'Telkomsel', 'Telkomsel', 'Masa aktif ikut operator', 6500, 8000, false, false, 0),
  ('pulsa', 'Pulsa 5.000', 'Indosat', 'Indosat', 'Masa aktif ikut operator', 6750, 8000, false, false, 1),
  ('pulsa', 'Pulsa 5.000', 'XL', 'XL', 'Masa aktif ikut operator', 7000, 8000, false, false, 2),
  ('pulsa', 'Pulsa 5.000', 'Tri', 'Tri', 'Masa aktif ikut operator', 7250, 8000, false, true, 3),
  ('pulsa', 'Pulsa 5.000', 'Smartfren', 'Smartfren', 'Masa aktif ikut operator', 7500, 8000, false, false, 4),
  ('pulsa', 'Pulsa 10.000', 'Telkomsel', 'Telkomsel', 'Masa aktif ikut operator', 11500, 13000, false, false, 5),
  ('pulsa', 'Pulsa 10.000', 'Indosat', 'Indosat', 'Masa aktif ikut operator', 11750, 13000, false, false, 6),
  ('pulsa', 'Pulsa 10.000', 'XL', 'XL', 'Masa aktif ikut operator', 12000, 13000, false, false, 7),
  ('pulsa', 'Pulsa 10.000', 'Tri', 'Tri', 'Masa aktif ikut operator', 12250, 13000, false, false, 8),
  ('pulsa', 'Pulsa 10.000', 'Smartfren', 'Smartfren', 'Masa aktif ikut operator', 12500, 13000, false, false, 9),
  ('pulsa', 'Pulsa 20.000', 'Telkomsel', 'Telkomsel', 'Masa aktif ikut operator', 21500, 23000, false, false, 10),
  ('pulsa', 'Pulsa 20.000', 'Indosat', 'Indosat', 'Masa aktif ikut operator', 21750, 23000, false, false, 11),
  ('pulsa', 'Pulsa 20.000', 'XL', 'XL', 'Masa aktif ikut operator', 22000, 23000, false, false, 12),
  ('pulsa', 'Pulsa 20.000', 'Tri', 'Tri', 'Masa aktif ikut operator', 22250, 23000, false, false, 13),
  ('pulsa', 'Pulsa 20.000', 'Smartfren', 'Smartfren', 'Masa aktif ikut operator', 22500, 23000, false, false, 14),
  ('pulsa', 'Pulsa 25.000', 'Telkomsel', 'Telkomsel', 'Masa aktif ikut operator', 26500, 28000, false, false, 15),
  ('pulsa', 'Pulsa 25.000', 'Indosat', 'Indosat', 'Masa aktif ikut operator', 26750, 28000, false, false, 16),
  ('pulsa', 'Pulsa 25.000', 'XL', 'XL', 'Masa aktif ikut operator', 27000, 28000, false, false, 17),
  ('pulsa', 'Pulsa 25.000', 'Tri', 'Tri', 'Masa aktif ikut operator', 27250, 28000, false, false, 18),
  ('pulsa', 'Pulsa 25.000', 'Smartfren', 'Smartfren', 'Masa aktif ikut operator', 27500, 28000, false, false, 19),
  ('pulsa', 'Pulsa 50.000', 'Telkomsel', 'Telkomsel', 'Masa aktif ikut operator', 51500, 53000, false, false, 20),
  ('pulsa', 'Pulsa 50.000', 'Indosat', 'Indosat', 'Masa aktif ikut operator', 51750, 53000, false, false, 21),
  ('pulsa', 'Pulsa 50.000', 'XL', 'XL', 'Masa aktif ikut operator', 52000, 53000, false, false, 22),
  ('pulsa', 'Pulsa 50.000', 'Tri', 'Tri', 'Masa aktif ikut operator', 52250, 53000, false, false, 23),
  ('pulsa', 'Pulsa 50.000', 'Smartfren', 'Smartfren', 'Masa aktif ikut operator', 52500, 53000, false, false, 24),
  ('pulsa', 'Pulsa 100.000', 'Telkomsel', 'Telkomsel', 'Masa aktif ikut operator', 101500, 103000, false, false, 25),
  ('pulsa', 'Pulsa 100.000', 'Indosat', 'Indosat', 'Masa aktif ikut operator', 101750, 103000, false, false, 26),
  ('pulsa', 'Pulsa 100.000', 'XL', 'XL', 'Masa aktif ikut operator', 102000, 103000, false, false, 27),
  ('pulsa', 'Pulsa 100.000', 'Tri', 'Tri', 'Masa aktif ikut operator', 102250, 103000, false, false, 28),
  ('pulsa', 'Pulsa 100.000', 'Smartfren', 'Smartfren', 'Masa aktif ikut operator', 102500, 103000, false, false, 29),
  ('data', 'Kuota 3 GB', 'Telkomsel', 'Telkomsel', '7 hari', 19800, 22800, false, false, 30),
  ('data', 'Kuota 3 GB', 'Indosat', 'Indosat', '7 hari', 18800, 21600, false, false, 31),
  ('data', 'Kuota 3 GB', 'XL', 'XL', '7 hari', 17800, 20500, false, false, 32),
  ('data', 'Kuota 3 GB', 'Tri', 'Tri', '7 hari', 16800, 19300, false, false, 33),
  ('data', 'Kuota 10 GB', 'Telkomsel', 'Telkomsel', '30 hari', 38000, 43700, false, false, 34),
  ('data', 'Kuota 10 GB', 'Indosat', 'Indosat', '30 hari', 36100, 41500, false, false, 35),
  ('data', 'Kuota 10 GB', 'XL', 'XL', '30 hari', 34200, 39300, false, false, 36),
  ('data', 'Kuota 10 GB', 'Tri', 'Tri', '30 hari', 32300, 37100, false, false, 37),
  ('data', 'Kuota 25 GB', 'Telkomsel', 'Telkomsel', '30 hari', 77000, 88600, false, false, 38),
  ('data', 'Kuota 25 GB', 'Indosat', 'Indosat', '30 hari', 73200, 84200, false, false, 39),
  ('data', 'Kuota 25 GB', 'XL', 'XL', '30 hari', 69300, 79700, false, false, 40),
  ('data', 'Kuota 25 GB', 'Tri', 'Tri', '30 hari', 65500, 75300, false, false, 41),
  ('data', 'Kuota 50 GB', 'Telkomsel', 'Telkomsel', '30 hari', 142000, 163300, false, false, 42),
  ('data', 'Kuota 50 GB', 'Indosat', 'Indosat', '30 hari', 134900, 155100, false, false, 43),
  ('data', 'Kuota 50 GB', 'XL', 'XL', '30 hari', 127800, 147000, false, false, 44),
  ('data', 'Kuota 50 GB', 'Tri', 'Tri', '30 hari', 120700, 138800, false, false, 45),
  ('pln', 'Token 20.000', 'PLN', 'Token', 'Token langsung dikirim', 20000, null, false, false, 46),
  ('pln', 'Token 50.000', 'PLN', 'Token', 'Token langsung dikirim', 50000, null, false, false, 47),
  ('pln', 'Token 100.000', 'PLN', 'Token', 'Token langsung dikirim', 100000, null, false, false, 48),
  ('pln', 'Token 200.000', 'PLN', 'Token', 'Token langsung dikirim', 200000, null, false, false, 49),
  ('pln', 'Token 500.000', 'PLN', 'Token', 'Token langsung dikirim', 500000, null, false, false, 50),
  ('pln', 'Token 1000.000', 'PLN', 'Token', 'Token langsung dikirim', 1000000, null, false, false, 51),
  ('pln', 'Tagihan Listrik', 'PLN', 'Tagihan', 'Pascabayar', 0, null, true, false, 52),
  ('ewallet', 'Saldo 25.000', 'GoPay', 'GoPay', 'Top up instan', 25000, null, false, false, 53),
  ('ewallet', 'Saldo 25.000', 'OVO', 'OVO', 'Top up instan', 25000, null, false, false, 54),
  ('ewallet', 'Saldo 25.000', 'DANA', 'DANA', 'Top up instan', 25000, null, false, false, 55),
  ('ewallet', 'Saldo 25.000', 'ShopeePay', 'ShopeePay', 'Top up instan', 25000, null, false, false, 56),
  ('ewallet', 'Saldo 50.000', 'GoPay', 'GoPay', 'Top up instan', 50000, null, false, false, 57),
  ('ewallet', 'Saldo 50.000', 'OVO', 'OVO', 'Top up instan', 50000, null, false, false, 58),
  ('ewallet', 'Saldo 50.000', 'DANA', 'DANA', 'Top up instan', 50000, null, false, false, 59),
  ('ewallet', 'Saldo 50.000', 'ShopeePay', 'ShopeePay', 'Top up instan', 50000, null, false, false, 60),
  ('ewallet', 'Saldo 100.000', 'GoPay', 'GoPay', 'Top up instan', 100000, null, false, false, 61),
  ('ewallet', 'Saldo 100.000', 'OVO', 'OVO', 'Top up instan', 100000, null, false, false, 62),
  ('ewallet', 'Saldo 100.000', 'DANA', 'DANA', 'Top up instan', 100000, null, false, false, 63),
  ('ewallet', 'Saldo 100.000', 'ShopeePay', 'ShopeePay', 'Top up instan', 100000, null, false, false, 64),
  ('ewallet', 'Saldo 200.000', 'GoPay', 'GoPay', 'Top up instan', 200000, null, false, false, 65),
  ('ewallet', 'Saldo 200.000', 'OVO', 'OVO', 'Top up instan', 200000, null, false, false, 66),
  ('ewallet', 'Saldo 200.000', 'DANA', 'DANA', 'Top up instan', 200000, null, false, false, 67),
  ('ewallet', 'Saldo 200.000', 'ShopeePay', 'ShopeePay', 'Top up instan', 200000, null, false, false, 68),
  ('internet', 'Tagihan Bulanan', 'IndiHome', 'IndiHome', 'Sesuai tagihan', 0, null, true, false, 69),
  ('internet', 'Tagihan Bulanan', 'Biznet', 'Biznet', 'Sesuai tagihan', 0, null, true, false, 70),
  ('internet', 'Tagihan Bulanan', 'MyRepublic', 'MyRepublic', 'Sesuai tagihan', 0, null, true, false, 71),
  ('internet', 'Tagihan Bulanan', 'First Media', 'First Media', 'Sesuai tagihan', 0, null, true, false, 72),
  ('bpjs', 'Iuran Kesehatan', 'BPJS Kesehatan', 'Kesehatan', 'Sesuai kelas', 0, null, true, false, 73),
  ('bpjs', 'Iuran Ketenagakerjaan', 'BPJS Ketenagakerjaan', 'Ketenagakerjaan', 'Peserta mandiri', 0, null, true, false, 74),
  ('pdam', 'Tagihan Air', 'Kota Bandung', 'Jawa', 'Sesuai tagihan', 0, null, true, false, 75),
  ('pdam', 'Tagihan Air', 'Surabaya', 'Jawa', 'Sesuai tagihan', 0, null, true, false, 76),
  ('pdam', 'Tagihan Air', 'PAM Jaya Jakarta', 'Jawa', 'Sesuai tagihan', 0, null, true, false, 77),
  ('pdam', 'Tagihan Air', 'Tirtanadi Medan', 'Sumatra', 'Sesuai tagihan', 0, null, true, false, 78),
  ('pdam', 'Tagihan Air', 'Banjarmasin', 'Kalimantan', 'Sesuai tagihan', 0, null, true, false, 79),
  ('pdam', 'Tagihan Air', 'Makassar', 'Sulawesi', 'Sesuai tagihan', 0, null, true, false, 80),
  ('finance', 'Angsuran', 'Adira Finance', 'Motor', 'Sesuai jadwal', 0, null, true, false, 81),
  ('finance', 'Angsuran', 'FIF Group', 'Motor', 'Sesuai jadwal', 0, null, true, false, 82),
  ('finance', 'Angsuran', 'BAF', 'Mobil', 'Sesuai jadwal', 0, null, true, false, 83),
  ('finance', 'Angsuran', 'Mandiri Tunas', 'Mobil', 'Sesuai jadwal', 0, null, true, false, 84),
  ('finance', 'Angsuran', 'Home Credit', 'Elektronik', 'Sesuai jadwal', 0, null, true, false, 85);

-- FAQ
insert into public.faqs (cat, q, a, sort) values
  ('cara', 'Bagaimana cara membeli pulsa atau token PLN?', 'Pilih kategori (Pulsa atau Token PLN), pilih nominal, lalu klik <b>Beli</b>. Masukkan nomor HP atau nomor meter/ID pelanggan, periksa total harga termasuk biaya admin, lalu lanjutkan pembayaran. Pulsa atau token dikirim otomatis setelah pembayaran diterima.', 0),
  ('cara', 'Bagaimana cara cek status transaksi?', 'Buka halaman <a href="/cek-transaksi">Cek Transaksi</a>, lalu masukkan ID transaksi (diawali AVD-) atau nomor tujuan. Status dan riwayat prosesnya akan tampil tanpa perlu login.', 1),
  ('cara', 'Apakah transaksi bisa dilakukan 24 jam?', 'Bisa. Sistem kami memproses transaksi secara otomatis 24/7. Pada jam pemeliharaan operator atau bank tertentu (biasanya dini hari), proses bisa sedikit lebih lama.', 2),
  ('bayar', 'Metode pembayaran apa saja yang tersedia?', 'QRIS, transfer bank / virtual account (BCA, Mandiri, BNI, BRI), serta e-wallet seperti GoPay, OVO, DANA, dan ShopeePay.', 3),
  ('bayar', 'Apakah ada biaya admin?', 'Ada untuk sebagian produk, terutama pembayaran tagihan. Biaya admin selalu ditampilkan terpisah sebelum kamu membayar, jadi tidak ada biaya tersembunyi.', 4),
  ('bayar', 'Berapa lama proses refund?', 'Refund untuk transaksi gagal diproses otomatis maksimal 1×24 jam ke metode pembayaran asal. Waktu dana masuk ke rekening/e-wallet bisa bergantung pada bank atau penyedia e-wallet.', 5),
  ('masalah', 'Pulsa belum masuk, apa yang harus dilakukan?', 'Cek dulu statusnya di <a href="/cek-transaksi">Cek Transaksi</a>. Jika status <b>Diproses</b>, tunggu hingga 15 menit karena operator kadang mengalami antrean. Jika lebih dari 1 jam atau status <b>Gagal</b>, hubungi CS dengan menyertakan ID transaksi.', 6),
  ('masalah', 'Token PLN belum diterima.', 'Nomor token tampil di halaman <a href="/cek-transaksi">Cek Transaksi</a> begitu status <b>Berhasil</b>, lengkap dengan tombol salin. Jika status berhasil tetapi token tidak tampil, hubungi CS dan sebutkan ID transaksi serta nomor meter.', 7),
  ('masalah', 'Salah input nomor tujuan, bisa dibatalkan?', 'Transaksi yang sudah diproses ke operator tidak bisa dibatalkan karena dikirim otomatis. Jika status masih <b>Menunggu Pembayaran</b>, cukup jangan lanjutkan pembayaran. Untuk kasus lain, segera hubungi CS agar kami bantu cek.', 8),
  ('akun', 'Bagaimana menghubungi CS?', 'Hubungi kami lewat WhatsApp atau email di bagian <a href="#kontak">Masih butuh bantuan?</a> di bawah. Sertakan ID transaksi agar kami bisa membantu lebih cepat.', 9),
  ('akun', 'Apakah data saya aman?', 'Kami hanya meminta data yang diperlukan untuk transaksi (nomor tujuan) dan tidak membagikannya ke pihak lain di luar proses transaksi.', 10),
  ('akun', 'Apakah saya perlu membuat akun?', 'Tidak. Kamu bisa membeli dan mengecek status transaksi tanpa login. Simpan ID transaksi untuk pengecekan.', 11);

commit;

-- 8 kategori, 86 produk, 12 FAQ.
