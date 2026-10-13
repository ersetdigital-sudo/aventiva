"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { HELP_CATS, type Faq } from "@/data/faq";
import { Icon } from "@/lib/icons";
import { useSite } from "@/lib/site-context";

const strip = (html: string) => html.replace(/<[^>]+>/g, "");

export function HelpCenter({ faqs }: { faqs: Faq[] }) {
  const params = useSearchParams();
  const site = useSite();
  const [cat, setCat] = useState(() => params.get("k") ?? "");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<number | null>(null);

  // ?k=… dari luar (back/forward, navigasi) tetap diikuti
  useEffect(() => {
    setCat(params.get("k") ?? "");
  }, [params]);

  const query = q.trim().toLowerCase();
  const visible = faqs.map((f, i) => ({ f, i })).filter(
    ({ f }) => (!cat || f.cat === cat) && (!query || `${f.q} ${strip(f.a)}`.toLowerCase().includes(query)),
  );

  const title = cat ? (HELP_CATS.find((c) => c.key === cat)?.title ?? "Pertanyaan Umum") : "Pertanyaan Umum";

  function toggleCat(key: string) {
    setCat(cat === key ? "" : key);
    setOpen(null);
    document.getElementById("faq-h")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function reset() {
    setCat("");
    setQ("");
    setOpen(null);
  }

  return (
    <>
      <nav className="crumb" aria-label="Breadcrumb">
        <a href="/">Beranda</a>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Bantuan</span>
      </nav>

      <section className="hb-hero">
        <h1>Ada yang bisa kami bantu?</h1>
        <p>Cari jawaban cepat seputar transaksi, pembayaran, dan akun.</p>
        <div className="hb-search f-field" role="search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            className="f-inp"
            type="search"
            placeholder="Cari pertanyaan, misal: token PLN, refund…"
            aria-label="Cari pertanyaan"
            aria-controls="faq"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </section>

      <div className="cat-grid" role="group" aria-label="Filter kategori bantuan">
        {HELP_CATS.map((c) => (
          <button
            key={c.key}
            type="button"
            className="cat-card"
            aria-pressed={c.key === cat}
            onClick={() => toggleCat(c.key)}
          >
            <span className="ci">
              <Icon name={c.icon} width={24} />
            </span>
            <b>{c.title}</b>
            <span>{c.desc}</span>
          </button>
        ))}
      </div>

      <div className="sec-h" id="faq-h">
        <h2 id="faqt">{title}</h2>
        <button type="button" className="btn-o" hidden={!cat && !query} onClick={reset}>
          Tampilkan semua
        </button>
      </div>

      <div className="faq" id="faq" hidden={!visible.length}>
        {visible.map(({ f, i }) => (
          <div className={`faq-i${open === i ? " open" : ""}`} key={f.q}>
            <button
              type="button"
              className="faq-q"
              id={`q${i}`}
              aria-expanded={open === i}
              aria-controls={`a${i}`}
              onClick={() => setOpen(open === i ? null : i)}
            >
              {f.q}
              <Icon name="chev" width={20} />
            </button>
            <div className="faq-a" id={`a${i}`} role="region" aria-labelledby={`q${i}`}>
              <div>
                <p dangerouslySetInnerHTML={{ __html: f.a }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sp-card empty" hidden={visible.length > 0}>
        <svg width="96" height="80" viewBox="0 0 96 80" fill="none" aria-hidden="true">
          <circle cx="40" cy="36" r="24" fill="#EEF0FF" stroke="#4338CA" strokeWidth="5" />
          <path d="m58 54 16 16" stroke="#4338CA" strokeWidth="6" strokeLinecap="round" />
          <path
            d="M33 30c0-4 3-7 7-7s7 3 7 7c0 5-7 5-7 10M40 47h.01"
            stroke="#FDB022"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
        <p>
          Tidak ada pertanyaan yang cocok dengan “{q}”. Coba kata lain atau hubungi CS di bawah.
        </p>
      </div>

      <div className="sec-h" id="kontak">
        <h2>Masih butuh bantuan?</h2>
      </div>

      <div className="ct-grid">
        <div className="ct">
          <span className="ci" style={{ background: "#DCFCE7", color: "#15803D" }}>
            <Icon name="wa" width={24} />
          </span>
          <b>WhatsApp CS</b>
          <p>
            {site.waDisplay}
            <br />
            Respons tercepat untuk kendala transaksi.
          </p>
          <a className="btn-p btn-wa" target="_blank" rel="noopener" href={`https://wa.me/${site.waNumber}`}>
            Chat WhatsApp
          </a>
        </div>
        <div className="ct">
          <span className="ci" style={{ background: "#EEF0FF", color: "#4338CA" }}>
            <Icon name="mail" width={24} />
          </span>
          <b>Email</b>
          <p>
            {site.email}
            <br />
            Dibalas maks. 1×24 jam kerja.
          </p>
          <a className="btn-o" href={`mailto:${site.email}`}>
            Kirim Email
          </a>
        </div>
        <div className="ct">
          <span className="ci" style={{ background: "#FFF4DB", color: "#B45309" }}>
            <Icon name="clock" width={24} />
          </span>
          <b>Jam Operasional CS</b>
          <p>
            {site.hours}
            <br />
            {site.hoursNote}.
          </p>
        </div>
      </div>
    </>
  );
}
