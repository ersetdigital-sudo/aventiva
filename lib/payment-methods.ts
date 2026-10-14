import { QRIS_CODE, type FeeType, type PaymentMethod } from "./payment-types";

/** Validasi body metode pembayaran untuk route admin (POST & PATCH). */

const num = (v: unknown): number => {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "") return Number(v);
  return NaN;
};

const text = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);

const FEE_TYPES: FeeType[] = ["free", "fixed", "percent"];

/**
 * Bersihkan & validasi satu metode pembayaran (objek UTUH — untuk PATCH,
 * route sudah menggabungkan baris lama dengan perubahan lebih dulu).
 * `code` adalah penanda server (bukan dari admin) untuk aturan khusus QRIS.
 */
export function cleanPayment(
  body: Record<string, unknown>,
  code: string | null,
): { ok: true; value: Omit<PaymentMethod, "id"> } | { ok: false; error: string } {
  const name = text(body.name, 120);
  if (!name) return { ok: false, error: "Nama metode wajib diisi." };

  const grp = text(body.grp, 60);
  if (!grp) return { ok: false, error: "Grup wajib diisi." };

  const rawType = text(body.fee_type, 20) as FeeType;
  const fee_type: FeeType = FEE_TYPES.includes(rawType) ? rawType : "free";

  const fee_value = num(body.fee_value);
  if (!Number.isFinite(fee_value) || fee_value < 0) {
    return { ok: false, error: "Nilai biaya tidak boleh negatif." };
  }
  if (fee_type === "percent" && fee_value > 100) {
    return { ok: false, error: "Persen biaya maksimal 100." };
  }

  const account_no = text(body.account_no, 60);
  const account_name = text(body.account_name, 120);
  const logo = body.logo === null || body.logo === undefined ? null : text(body.logo, 400) || null;

  const active = Boolean(body.active);
  const isQrisRow = code === QRIS_CODE;
  if (active && !isQrisRow && (!account_no || !account_name)) {
    return {
      ok: false,
      error: "Nomor rekening/VA dan nama pemilik wajib diisi sebelum diaktifkan.",
    };
  }

  const rawSort = num(body.sort);
  const sort = Number.isFinite(rawSort) ? Math.round(rawSort) : 0;

  return {
    ok: true,
    value: {
      code,
      name,
      grp,
      descr: text(body.descr, 200),
      fee_type,
      fee_value: Math.round(fee_value),
      account_no,
      account_name,
      instructions: String(body.instructions ?? "").trim().slice(0, 2000),
      logo,
      active,
      sort,
    },
  };
}
