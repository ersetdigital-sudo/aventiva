"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { categoryByQuery } from "@/data/categories";
import { useCatalog } from "@/lib/catalog-context";
import { Icon } from "@/lib/icons";

export function Header() {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const CATS = useCatalog();

  const [scrolled, setScrolled] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [msearch, setMsearch] = useState(false);
  const [q, setQ] = useState(() => params.get("q") ?? "");
  const navRef = useRef<HTMLElement>(null);

  const onCek = pathname === "/cek-transaksi";
  const onHelp = pathname === "/bantuan";

  /** Kategori yang sedang aktif di nav — mengikuti ?c=, atau hasil pencarian ?q=. */
  const act = (() => {
    if (!pathname.startsWith("/layanan")) return "";
    const c = params.get("c");
    if (c && CATS[c]) return c;
    const query = (params.get("q") ?? "").toLowerCase();
    return (query && categoryByQuery(query, CATS)) || "pulsa";
  })();

  // sinkronkan lagi bila URL berubah dari luar (mis. navigasi back/forward)
  useEffect(() => {
    setQ(params.get("q") ?? "");
  }, [params]);

  useEffect(() => {
    const sh = () => setScrolled(window.scrollY > 4);
    sh();
    window.addEventListener("scroll", sh, { passive: true });
    return () => window.removeEventListener("scroll", sh);
  }, []);

  // gulir tab kategori aktif ke tengah (mobile)
  useEffect(() => {
    const el = navRef.current?.querySelector<HTMLElement>(".hn-cat.is-active");
    el?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [act, pathname]);

  /** Ganti ?q= tanpa reload saat sedang di halaman /layanan (pencarian langsung). */
  function liveSearch(v: string) {
    setQ(v);
    if (pathname === "/layanan") {
      const p = new URLSearchParams();
      if (v) p.set("q", v);
      window.history.replaceState(null, "", `/layanan${p.size ? `?${p}` : ""}`);
    }
  }

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    router.push(`/layanan${p.size ? `?${p}` : ""}`);
  }

  const searchForm = (
    <form action="/layanan" role="search" className="hn-search" onSubmit={submitSearch}>
      <span className="hn-sico">
        <Icon name="search" className="w-5 h-5" />
      </span>
      <input
        name="q"
        value={q}
        onChange={(e) => liveSearch(e.target.value)}
        placeholder="Cari pulsa, kuota, token PLN, BPJS…"
        aria-label="Cari produk"
        autoComplete="off"
      />
      <button type="submit">Cari</button>
    </form>
  );

  return (
    <header className={`hn${scrolled ? " scrolled" : ""}`}>
      <div className="hn-wrap">
        <div className="hn-main">
          <Link href="/" className="hn-logo">
            aventiva<span>.</span>
          </Link>
          <div className="hn-mid">{searchForm}</div>
          <div className="hn-right">
            <Link
              href="/cek-transaksi"
              className={`hn-link${onCek ? " is-active" : ""}`}
              aria-current={onCek ? "page" : undefined}
            >
              <Icon name="receiptHdr" className="w-5 h-5" />
              <span className="hn-lbl">Cek Transaksi</span>
            </Link>
            <Link
              href="/bantuan"
              className={`hn-link${onHelp ? " is-active" : ""}`}
              aria-current={onHelp ? "page" : undefined}
            >
              <Icon name="help" className="w-5 h-5" />
              <span className="hn-lbl">Bantuan</span>
            </Link>
          </div>
          <div className="hn-mob">
            <button
              type="button"
              className="hn-ib"
              aria-label="Tampilkan pencarian"
              aria-expanded={msearch}
              onClick={() => setMsearch((v) => !v)}
            >
              <Icon name="search" className="w-6 h-6" />
            </button>
            <button
              type="button"
              className="hn-ib"
              aria-label="Menu"
              aria-expanded={drawer}
              onClick={() => setDrawer((v) => !v)}
            >
              <Icon name={drawer ? "x" : "menu"} className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className={`hn-msearch${msearch ? " open" : ""}`} id="hnMS">
          {searchForm}
        </div>
        <nav className="hn-nav" aria-label="Kategori produk" ref={navRef}>
          {Object.entries(CATS).map(([k, c]) => (
            <Link
              key={k}
              href={`/layanan?c=${k}`}
              className={`hn-cat${k === act ? " is-active" : ""}`}
              aria-current={k === act ? "page" : undefined}
            >
              <Icon name={c.ico} className="w-5 h-5" />
              <span>{c.name}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="hn-drawer" hidden={!drawer}>
        <Link href="/cek-transaksi" className={onCek ? "is-active" : ""} onClick={() => setDrawer(false)}>
          <Icon name="receiptHdr" className="w-5 h-5" /> Cek Transaksi
        </Link>
        <Link href="/bantuan" className={onHelp ? "is-active" : ""} onClick={() => setDrawer(false)}>
          <Icon name="help" className="w-5 h-5" /> Bantuan
        </Link>
      </div>
    </header>
  );
}
