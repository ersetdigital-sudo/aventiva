/** Warna & inisial badge merek pada kartu produk. */
export const BRAND_BADGE: Record<string, string> = {
  Telkomsel: "#DC2626",
  Indosat: "#FDB022",
  XL: "#1D4ED8",
  Tri: "#7C3AED",
  Smartfren: "#DB2777",
  GoPay: "#0284C7",
  OVO: "#4C1D95",
  DANA: "#0369A1",
  ShopeePay: "#EA580C",
  PLN: "#0E7490",
};

export const BRAND_INITIAL: Record<string, string> = {
  Telkomsel: "TS",
  Indosat: "IM3",
  XL: "XL",
  Tri: "3",
  Smartfren: "SF",
  GoPay: "GP",
  OVO: "OVO",
  DANA: "DN",
  ShopeePay: "SP",
  PLN: "PLN",
};

/** Merek dengan teks gelap (kontras dengan latar terang). */
export const BRAND_DARK = new Set(["Indosat"]);

/** Warna nama merek untuk daftar kategori pembayaran footer. */
export const BRAND_COLORS: Record<string, string> = {
  Telkomsel: "#E11D2A",
  Indosat: "#F5B800",
  XL: "#1C4FA1",
  Tri: "#6D28D9",
  Smartfren: "#E4007F",
  GoPay: "#00AED6",
  OVO: "#4C2A86",
  DANA: "#118EEA",
  ShopeePay: "#EE4D2D",
  PLN: "#0B7FB0",
};

export function brandInitial(b: string) {
  return BRAND_INITIAL[b] ?? (b.replace(/[^A-Z0-9]/g, "").slice(0, 3) || b.slice(0, 2).toUpperCase());
}
