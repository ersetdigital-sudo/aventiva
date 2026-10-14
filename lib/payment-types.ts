import { rp } from "./format";

/** Tipe & util metode pembayaran — dipakai checkout customer & panel admin. */

export type FeeType = "free" | "fixed" | "percent";

export type PaymentMethod = {
  id: number;
  /** penanda khusus (mis. 'qris'); null untuk metode buatan admin */
  code: string | null;
  name: string;
  grp: string;
  descr: string;
  fee_type: FeeType;
  fee_value: number;
  account_no: string;
  account_name: string;
  instructions: string;
  logo: string | null;
  active: boolean;
  sort: number;
};

export type MethodGroup = { grp: string; items: PaymentMethod[] };

/** Baris bawaan sistem yang tidak boleh dihapus. */
export const QRIS_CODE = "qris";

export const FEE_TYPES: { value: FeeType; label: string }[] = [
  { value: "free", label: "Gratis" },
  { value: "fixed", label: "Nominal tetap (Rp)" },
  { value: "percent", label: "Persen (%)" },
];

export function isQris(m: Pick<PaymentMethod, "code">): boolean {
  return m.code === QRIS_CODE;
}

/** Biaya metode untuk dasar harga tertentu (rupiah, dibulatkan). */
export function feeOf(m: Pick<PaymentMethod, "fee_type" | "fee_value">, base: number): number {
  if (m.fee_type === "fixed") return Math.max(0, Math.round(m.fee_value));
  if (m.fee_type === "percent") return Math.max(0, Math.round((base * m.fee_value) / 100));
  return 0;
}

/** Label biaya untuk kartu pilihan ("Gratis" / "+Rp1.000"). */
export function feeLabel(m: Pick<PaymentMethod, "fee_type" | "fee_value">, base: number): string {
  const f = feeOf(m, base);
  return f > 0 ? `+${rp(f)}` : "Gratis";
}

/** Kelompokkan metode sesuai urutan kemunculan (grup tanpa isi tidak muncul). */
export function groupMethods(list: PaymentMethod[]): MethodGroup[] {
  const order: string[] = [];
  const map = new Map<string, PaymentMethod[]>();
  for (const m of list) {
    const g = m.grp.trim() || "Lainnya";
    if (!map.has(g)) {
      map.set(g, []);
      order.push(g);
    }
    map.get(g)!.push(m);
  }
  return order.map((grp) => ({ grp, items: map.get(grp)! }));
}

/** Daftar grup unik (untuk saran pilihan di form admin). */
export function groupNames(list: PaymentMethod[]): string[] {
  return [...new Set(list.map((m) => m.grp.trim()).filter(Boolean))];
}

/**
 * Cadangan saat Supabase belum dikonfigurasi: hanya QRIS (gratis, aktif)
 * supaya alur checkout tetap jalan dalam mode statis/offline.
 */
export const FALLBACK_METHODS: PaymentMethod[] = [
  {
    id: 0,
    code: QRIS_CODE,
    name: "QRIS",
    grp: "QRIS",
    descr: "Scan dari semua e-wallet & m-banking",
    fee_type: "free",
    fee_value: 0,
    account_no: "",
    account_name: "",
    instructions: "Scan kode QRIS dengan aplikasi e-wallet atau m-banking.",
    logo: null,
    active: true,
    sort: 0,
  },
];
