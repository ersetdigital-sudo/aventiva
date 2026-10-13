/** FAQ & kategori bantuan. `a` boleh berisi HTML ringan (<b>, <a>, <em>). */

export type HelpCategory = { key: string; title: string; desc: string; icon: string };

export const HELP_CATS: HelpCategory[] = [
  { key: "cara", title: "Cara Transaksi", desc: "Langkah membeli produk digital", icon: "clipboard" },
  { key: "bayar", title: "Pembayaran", desc: "Metode, biaya admin & refund", icon: "card" },
  { key: "masalah", title: "Masalah Transaksi", desc: "Pulsa/token belum masuk, salah nomor", icon: "alert" },
  { key: "akun", title: "Akun & Keamanan", desc: "Keamanan data & menghubungi CS", icon: "shieldCheck" },
];

export type Faq = { cat: string; q: string; a: string };

export const FAQ: Faq[] = [
  {
    cat: "cara",
    q: "Bagaimana cara membeli pulsa atau token PLN?",
    a: "Pilih kategori (Pulsa atau Token PLN), pilih nominal, lalu klik <b>Beli</b>. Masukkan nomor HP atau nomor meter/ID pelanggan, periksa total harga termasuk biaya admin, lalu lanjutkan pembayaran. Pulsa atau token dikirim otomatis setelah pembayaran diterima.",
  },
  {
    cat: "cara",
    q: "Bagaimana cara cek status transaksi?",
    a: 'Buka halaman <a href="/cek-transaksi">Cek Transaksi</a>, lalu masukkan ID transaksi (diawali AVD-) atau nomor tujuan. Status dan riwayat prosesnya akan tampil tanpa perlu login.',
  },
  {
    cat: "cara",
    q: "Apakah transaksi bisa dilakukan 24 jam?",
    a: "Bisa. Sistem kami memproses transaksi secara otomatis 24/7. Pada jam pemeliharaan operator atau bank tertentu (biasanya dini hari), proses bisa sedikit lebih lama.",
  },
  {
    cat: "bayar",
    q: "Metode pembayaran apa saja yang tersedia?",
    a: "QRIS, transfer bank / virtual account (BCA, Mandiri, BNI, BRI), serta e-wallet seperti GoPay, OVO, DANA, dan ShopeePay.",
  },
  {
    cat: "bayar",
    q: "Apakah ada biaya admin?",
    a: "Ada untuk sebagian produk, terutama pembayaran tagihan. Biaya admin selalu ditampilkan terpisah sebelum kamu membayar, jadi tidak ada biaya tersembunyi.",
  },
  {
    cat: "bayar",
    q: "Berapa lama proses refund?",
    a: "Refund untuk transaksi gagal diproses otomatis maksimal 1×24 jam ke metode pembayaran asal. Waktu dana masuk ke rekening/e-wallet bisa bergantung pada bank atau penyedia e-wallet.",
  },
  {
    cat: "masalah",
    q: "Pulsa belum masuk, apa yang harus dilakukan?",
    a: 'Cek dulu statusnya di <a href="/cek-transaksi">Cek Transaksi</a>. Jika status <b>Diproses</b>, tunggu hingga 15 menit karena operator kadang mengalami antrean. Jika lebih dari 1 jam atau status <b>Gagal</b>, hubungi CS dengan menyertakan ID transaksi.',
  },
  {
    cat: "masalah",
    q: "Token PLN belum diterima.",
    a: 'Nomor token tampil di halaman <a href="/cek-transaksi">Cek Transaksi</a> begitu status <b>Berhasil</b>, lengkap dengan tombol salin. Jika status berhasil tetapi token tidak tampil, hubungi CS dan sebutkan ID transaksi serta nomor meter.',
  },
  {
    cat: "masalah",
    q: "Salah input nomor tujuan, bisa dibatalkan?",
    a: "Transaksi yang sudah diproses ke operator tidak bisa dibatalkan karena dikirim otomatis. Jika status masih <b>Menunggu Pembayaran</b>, cukup jangan lanjutkan pembayaran. Untuk kasus lain, segera hubungi CS agar kami bantu cek.",
  },
  {
    cat: "akun",
    q: "Bagaimana menghubungi CS?",
    a: 'Hubungi kami lewat WhatsApp atau email di bagian <a href="#kontak">Masih butuh bantuan?</a> di bawah. Sertakan ID transaksi agar kami bisa membantu lebih cepat.',
  },
  {
    cat: "akun",
    q: "Apakah data saya aman?",
    a: "Kami hanya meminta data yang diperlukan untuk transaksi (nomor tujuan) dan tidak membagikannya ke pihak lain di luar proses transaksi.",
  },
  {
    cat: "akun",
    q: "Apakah saya perlu membuat akun?",
    a: "Tidak. Kamu bisa membeli dan mengecek status transaksi tanpa login. Simpan ID transaksi untuk pengecekan.",
  },
];
