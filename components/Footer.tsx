"use client";
import Link from "next/link";
import { useState } from "react";
import { FOOTER_COLS, PAYMENT_CHIPS, TRUST } from "@/data/site";
import { Icon } from "@/lib/icons";
import { useSite } from "@/lib/site-context";

export function Footer() {
  const [open, setOpen] = useState<number | null>(null);
  const site = useSite();

  const SOCIALS = [
    { icon: "ig", label: "Instagram", href: site.social.instagram },
    { icon: "fb", label: "Facebook", href: site.social.facebook },
    { icon: "tt", label: "TikTok", href: site.social.tiktok },
    { icon: "wa", label: "WhatsApp", href: `https://wa.me/${site.waNumber}` },
  ];

  return (
    <footer className="ft">
      <div className="ft-trust">
        <div className="ft-wrap ft-trust-g">
          {TRUST.map((t) => (
            <div className="ft-tr" key={t.title}>
              <span className="ft-tri">
                <Icon name={t.icon} width={32} />
              </span>
              <div>
                <b>{t.title}</b>
                <p>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ft-wrap ft-main">
        <div className="ft-brand">
          <Link href="/" className="ft-logo">
            aventiva<span>.</span>
          </Link>
          <p>{site.description}</p>
          <div className="ft-soc">
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} aria-label={s.label} target="_blank" rel="noopener">
                <Icon name={s.icon} width={20} />
              </a>
            ))}
          </div>
        </div>

        {FOOTER_COLS.map((col, n) => (
          <div className={`ft-col${open === n ? " open" : ""}`} key={col.title}>
            <button
              type="button"
              className="ft-h"
              aria-expanded={open === n}
              aria-controls={`ftc${n}`}
              onClick={() => setOpen(open === n ? null : n)}
            >
              {col.title}
              <span className="ft-chev">
                <Icon name="chev" width={18} />
              </span>
            </button>
            <ul id={`ftc${n}`}>
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="ft-wrap ft-cp">
        <div className="ft-contact">
          <a href={`https://wa.me/${site.waNumber}`} target="_blank" rel="noopener">
            <Icon name="wa" width={18} />
            <span>
              WhatsApp CS: <b>{site.waDisplay}</b>
            </span>
          </a>
          <a href={`mailto:${site.email}`}>
            <Icon name="mail" width={18} />
            <span>{site.email}</span>
          </a>
          <span>
            <Icon name="clock" width={18} />
            <span>CS: {site.hours}</span>
          </span>
        </div>
        <div className="ft-pay">
          <span className="ft-pl">Metode pembayaran</span>
          <div>
            {PAYMENT_CHIPS.map(([name, color]) => (
              <span className="ft-chip" key={name} style={{ ["--c" as string]: color }}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="ft-bot">
        <div className="ft-wrap ft-bot-in">
          <span>© 2026 Aventiva Digital. Seluruh hak dilindungi.</span>
          <nav>
            <a href="#">Syarat &amp; Ketentuan</a>
            <span aria-hidden="true">|</span>
            <a href="#">Kebijakan Privasi</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
