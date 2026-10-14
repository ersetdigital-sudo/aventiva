/** Bentuk transaksi yang dipakai UI (identik dengan localStorage). */
export type Status = "pending" | "process" | "success" | "failed" | "expired";

export type Tx = {
  /** ID transaksi, contoh AVD-MV6FS4LG */
  id: string;
  /** label produk */
  n: string;
  /** nomor tujuan */
  t: string;
  /** nominal rupiah */
  p: number;
  /** waktu dibuat (epoch ms) */
  d: number;
  s: Status;
  /** nomor token listrik (bila ada) */
  token?: string;
  /** metode pembayaran */
  pm?: string;
  /** biaya layanan metode pembayaran (rupiah) */
  fee?: number;
  /** kategori produk (opsional) */
  k?: string;
};
