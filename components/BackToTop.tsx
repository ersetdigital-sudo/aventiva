"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/lib/icons";

/** Tombol kembali ke atas (muncul setelah scroll 400px). */
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const chk = () => setShow(window.scrollY > 400);
    chk();
    window.addEventListener("scroll", chk, { passive: true });
    return () => window.removeEventListener("scroll", chk);
  }, []);

  return (
    <button
      type="button"
      className={`ft-up${show ? " show" : ""}`}
      aria-label="Kembali ke atas"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <Icon name="up" width={22} />
    </button>
  );
}
