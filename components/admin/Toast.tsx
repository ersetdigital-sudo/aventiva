"use client";

import { useEffect } from "react";
import { Icon } from "@/lib/icons";

export type ToastKind = "ok" | "err";
export type ToastData = { id: number; kind: ToastKind; text: string };

/**
 * Toast ringan: pojok kanan-atas (mobile: atas-tengah), slide + fade halus,
 * auto-tutup ~3 detik, bisa ditutup manual. Karena hanya satu yang dirender,
 * notifikasi beruntun saling mengganti (tidak menumpuk).
 */
export function Toast({
  data,
  onClose,
  duration = 3000,
}: {
  data: ToastData | null;
  onClose: () => void;
  duration?: number;
}) {
  useEffect(() => {
    if (!data) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [data, duration, onClose]);

  if (!data) return null;

  return (
    <div
      key={data.id}
      className={`adm-toast adm-toast--${data.kind}`}
      role="status"
      aria-live="polite"
    >
      <span className="adm-toast-ic">
        <Icon name={data.kind === "ok" ? "check" : "alert"} width={18} height={18} />
      </span>
      <span className="adm-toast-tx">{data.text}</span>
      <button
        type="button"
        className="adm-toast-x"
        aria-label="Tutup notifikasi"
        onClick={onClose}
      >
        <Icon name="x" width={14} height={14} />
      </button>
    </div>
  );
}
