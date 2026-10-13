/** Metode pembayaran (di-port dari assets/shop.js). */

export type PayOption = {
  group: string;
  value: string;
  desc: string;
  subs?: [string, string][];
};

export const PAY: PayOption[] = [
  { group: "QRIS", value: "qris", desc: "Scan dari semua e-wallet & m-banking" },
  {
    group: "Virtual Account",
    value: "va",
    desc: "BCA, Mandiri, BNI, BRI",
    subs: [
      ["BCA", "va-bca"],
      ["Mandiri", "va-mandiri"],
      ["BNI", "va-bni"],
      ["BRI", "va-bri"],
    ],
  },
  {
    group: "E-Wallet",
    value: "ew",
    desc: "Bayar langsung dari aplikasi",
    subs: [
      ["GoPay", "gopay"],
      ["OVO", "ovo"],
      ["DANA", "dana"],
      ["ShopeePay", "shopeepay"],
    ],
  },
];

export const FEE: Record<string, number> = {
  qris: 0,
  "va-bca": 1000,
  "va-mandiri": 1000,
  "va-bni": 1000,
  "va-bri": 1000,
  gopay: 0,
  ovo: 0,
  dana: 0,
  shopeepay: 0,
};
