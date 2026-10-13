/** Konfigurasi kontak & identitas situs. Ganti nilai di sini, otomatis dipakai header/footer/halaman bantuan. */
export const SITE = {
  name: "Aventiva Digital",
  tagline: "Digital transactions. Simplified.",
  /** Domain dasar untuk metadata, sitemap & canonical. */
  url: "https://aventivadigital.net",
  waNumber: "6281200000000", // format internasional tanpa + / spasi
  waDisplay: "+62 812-0000-0000",
  email: "cs@aventivadigital.net",
  hours: "Setiap hari, 08.00–22.00 WIB",
  hoursNote: "Transaksi otomatis tetap berjalan 24/7",
  social: { instagram: "#", facebook: "#", tiktok: "#" },
  description:
    "Platform pembelian pulsa, paket data, token PLN, e-wallet, dan pembayaran tagihan dengan harga jelas dan proses otomatis.",
};

export type FooterCol = { title: string; links: { label: string; href: string }[] };

export const FOOTER_COLS: FooterCol[] = [
  {
    title: "Produk",
    links: [
      { label: "Pulsa", href: "/layanan?c=pulsa" },
      { label: "Paket Data", href: "/layanan?c=data" },
      { label: "Token PLN", href: "/layanan?c=pln" },
      { label: "E-Wallet", href: "/layanan?c=ewallet" },
      { label: "Internet", href: "/layanan?c=internet" },
      { label: "BPJS", href: "/layanan?c=bpjs" },
      { label: "PDAM", href: "/layanan?c=pdam" },
      { label: "Multifinance", href: "/layanan?c=finance" },
    ],
  },
  {
    title: "Bantuan",
    links: [
      { label: "Cara Transaksi", href: "/bantuan?k=cara" },
      { label: "Cek Transaksi", href: "/cek-transaksi" },
      { label: "FAQ", href: "/bantuan#faq" },
      { label: "Hubungi Kami", href: "/bantuan#kontak" },
      { label: "Pusat Bantuan", href: "/bantuan" },
    ],
  },
  {
    title: "Perusahaan",
    links: [
      { label: "Tentang Kami", href: "#" },
      { label: "Syarat & Ketentuan", href: "#" },
      { label: "Kebijakan Privasi", href: "#" },
      { label: "Kemitraan/Reseller", href: "#" },
    ],
  },
];

export const TRUST = [
  { icon: "tag", title: "Harga Transparan", desc: "Biaya admin terlihat sebelum bayar" },
  { icon: "zap", title: "Transaksi Cepat", desc: "Proses otomatis 24/7" },
  { icon: "lock", title: "Pembayaran Aman", desc: "Berbagai metode pembayaran resmi" },
] as const;

export const PAYMENT_CHIPS = [
  ["QRIS", "#E4002B"],
  ["BCA", "#0060AF"],
  ["Mandiri", "#003D79"],
  ["BNI", "#F15A23"],
  ["BRI", "#00529C"],
  ["GoPay", "#00AED6"],
  ["OVO", "#4C2A86"],
  ["DANA", "#118EEA"],
  ["ShopeePay", "#EE4D2D"],
] as const;
