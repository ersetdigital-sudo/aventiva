/** Rupiah format (id-ID). */
export const rp = (n: number) => "Rp" + n.toLocaleString("id-ID");

/** Tanggal + jam format Indonesia. */
export const fmtDate = (t: number) =>
  new Date(t).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) + " WIB";

/** Batas waktu pembayaran (jam ke depan). */
export const fmtShort = (t: number) =>
  new Date(t).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
