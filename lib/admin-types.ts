import type { Status } from "./tx-types";

/** Bentuk data admin — dipakai bersama oleh /api/admin/* dan komponen panel. */

export type AdminCategory = {
  key: string;
  name: string;
  ico: string;
  label: string;
  admin: number;
  filters: string[];
  sort: number;
};

export type AdminProduct = {
  id: number;
  cat_key: string;
  n: string;
  b: string;
  f: string;
  d: string;
  p: number;
  o: number | null;
  bill: boolean;
  soldout: boolean;
  sort: number;
};

export type AdminTransaction = {
  id: string;
  cat_key: string | null;
  name: string;
  target: string;
  amount: number;
  status: Status;
  payment_method: string | null;
  token: string | null;
  created_at: string;
};

export type TableCount = { table: string; n: number | null; err: string | null };

export type AdminOverview = {
  /** kunci rahasia server tersedia → perubahan bisa disimpan */
  canWrite: boolean;
  /** kunci publishable tersedia → situs membaca dari Supabase */
  storefrontDb: boolean;
  counts: TableCount[];
  stats: {
    total: number;
    byStatus: Record<Status, number>;
    revenue: number;
    today: number;
    last7: number;
  } | null;
};

export const STATUS_LABEL: Record<Status, string> = {
  pending: "Menunggu Pembayaran",
  process: "Diproses",
  success: "Berhasil",
  failed: "Gagal",
  expired: "Kedaluwarsa",
};

export const STATUS_ORDER: Status[] = ["pending", "process", "success", "failed", "expired"];

/** Warna badge status (kelas .st-* dari globals.css). */
export const STATUS_CLASS: Record<Status, string> = {
  pending: "st-pending",
  process: "st-process",
  success: "st-success",
  failed: "st-failed",
  expired: "st-expired",
};
