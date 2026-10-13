/** Data katalog produk (di-port dari assets/shop.js). Tambah produk cukup edit file ini. */

export type ProductItem = {
  /** nama produk */
  n: string;
  /** brand / penyedia */
  b: string;
  /** filter (sub-kategori) */
  f: string;
  /** keterangan singkat */
  d: string;
  /** harga jual */
  p: number;
  /** harga coret (sebelum diskon) */
  o?: number;
  /** produk tagihan (harga dicek saat bayar) */
  bill?: boolean;
  soldout?: boolean;
};

export type Category = {
  name: string;
  ico: string;
  /** label input tujuan pada form pembelian */
  label: string;
  /** biaya admin rupiah */
  admin: number;
  filters: string[];
  items: ProductItem[];
};

const OPS5 = ["Telkomsel", "Indosat", "XL", "Tri", "Smartfren"];
const OPS4 = ["Telkomsel", "Indosat", "XL", "Tri"];

const pulsaItems: ProductItem[] = [5, 10, 20, 25, 50, 100].flatMap((v) =>
  OPS5.map((op, i) => ({
    n: `Pulsa ${v}.000`,
    b: op,
    f: op,
    d: "Masa aktif ikut operator",
    p: v * 1000 + 1500 + i * 250,
    o: v * 1000 + 3000,
    soldout: v === 5 && op === "Tri",
  })),
);

const dataItems: ProductItem[] = (
  [
    ["3 GB", 7],
    ["10 GB", 30],
    ["25 GB", 30],
    ["50 GB", 30],
  ] as [string, number][]
).flatMap(([g, h]) =>
  OPS4.map((op, i) => {
    const p = Math.round((parseInt(g) * 2600 + 12000) * (1 - i * 0.05) / 100) * 100;
    return { n: `Kuota ${g}`, b: op, f: op, d: `${h} hari`, p, o: Math.round((p * 1.15) / 100) * 100 };
  }),
);

const plnItems: ProductItem[] = [
  ...[20, 50, 100, 200, 500, 1000].map((v) => ({
    n: `Token ${v}.000`,
    b: "PLN",
    f: "Token",
    d: "Token langsung dikirim",
    p: v * 1000,
  })),
  { n: "Tagihan Listrik", b: "PLN", f: "Tagihan", d: "Pascabayar", p: 0, bill: true },
];

const ewalletItems: ProductItem[] = [25, 50, 100, 200].flatMap((v) =>
  ["GoPay", "OVO", "DANA", "ShopeePay"].map((o) => ({
    n: `Saldo ${v}.000`,
    b: o,
    f: o,
    d: "Top up instan",
    p: v * 1000,
  })),
);

const internetItems: ProductItem[] = ["IndiHome", "Biznet", "MyRepublic", "First Media"].map((o) => ({
  n: "Tagihan Bulanan",
  b: o,
  f: o,
  d: "Sesuai tagihan",
  p: 0,
  bill: true,
}));

const bpjsItems: ProductItem[] = [
  { n: "Iuran Kesehatan", b: "BPJS Kesehatan", f: "Kesehatan", d: "Sesuai kelas", p: 0, bill: true },
  { n: "Iuran Ketenagakerjaan", b: "BPJS Ketenagakerjaan", f: "Ketenagakerjaan", d: "Peserta mandiri", p: 0, bill: true },
];

const pdamItems: ProductItem[] = (
  [
    ["Kota Bandung", "Jawa"],
    ["Surabaya", "Jawa"],
    ["PAM Jaya Jakarta", "Jawa"],
    ["Tirtanadi Medan", "Sumatra"],
    ["Banjarmasin", "Kalimantan"],
    ["Makassar", "Sulawesi"],
  ] as [string, string][]
).map(([n, f]) => ({ n: "Tagihan Air", b: n, f, d: "Sesuai tagihan", p: 0, bill: true }));

const financeItems: ProductItem[] = (
  [
    ["Adira Finance", "Motor"],
    ["FIF Group", "Motor"],
    ["BAF", "Mobil"],
    ["Mandiri Tunas", "Mobil"],
    ["Home Credit", "Elektronik"],
  ] as [string, string][]
).map(([n, f]) => ({ n: "Angsuran", b: n, f, d: "Sesuai jadwal", p: 0, bill: true }));

export const CATS: Record<string, Category> = {
  pulsa: {
    name: "Pulsa",
    ico: "phone",
    label: "Nomor HP",
    admin: 0,
    filters: OPS5,
    items: pulsaItems,
  },
  data: { name: "Paket Data", ico: "signal", label: "Nomor HP", admin: 0, filters: OPS4, items: dataItems },
  pln: {
    name: "Token PLN",
    ico: "zap",
    label: "No. Meter / ID Pelanggan",
    admin: 2500,
    filters: ["Token", "Tagihan"],
    items: plnItems,
  },
  ewallet: {
    name: "E-Wallet",
    ico: "wallet",
    label: "Nomor Akun",
    admin: 1000,
    filters: ["GoPay", "OVO", "DANA", "ShopeePay"],
    items: ewalletItems,
  },
  internet: {
    name: "Internet",
    ico: "globe",
    label: "ID Pelanggan",
    admin: 2500,
    filters: ["IndiHome", "Biznet", "MyRepublic", "First Media"],
    items: internetItems,
  },
  bpjs: {
    name: "BPJS",
    ico: "shield",
    label: "Nomor VA",
    admin: 2500,
    filters: ["Kesehatan", "Ketenagakerjaan"],
    items: bpjsItems,
  },
  pdam: {
    name: "PDAM",
    ico: "drop",
    label: "ID Pelanggan",
    admin: 2500,
    filters: ["Jawa", "Sumatra", "Kalimantan", "Sulawesi"],
    items: pdamItems,
  },
  finance: {
    name: "Multifinance",
    ico: "car",
    label: "Nomor Kontrak",
    admin: 5000,
    filters: ["Motor", "Mobil", "Elektronik"],
    items: financeItems,
  },
};

export const CAT_KEYS = Object.keys(CATS);

/** Cari kategori yang paling cocok dengan kata kunci pencarian. */
export function categoryByQuery(
  q: string,
  cats: Record<string, Category> = CATS,
): string | null {
  if (!q) return null;
  return (
    Object.keys(cats).find((k) =>
      cats[k].items.some((i) => `${i.n} ${i.b} ${cats[k].name}`.toLowerCase().includes(q)),
    ) ?? null
  );
}
