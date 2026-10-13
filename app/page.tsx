import type { Metadata } from "next";
import Link from "next/link";
import { ProductGrid } from "@/components/ProductGrid";
import { Reveal } from "@/components/Reveal";
import { getCatalog } from "@/lib/db";
import { Icon } from "@/lib/icons";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const USP = [
  { icon: "receipt", title: "Harga transparan", desc: "Harga & biaya admin ditampilkan terpisah sebelum checkout." },
  { icon: "search", title: "Status jelas", desc: "Setiap pesanan punya nomor referensi untuk dipantau." },
  { icon: "chat", title: "Bantuan siap", desc: "Ada kendala? Hubungi tim kami dengan nomor referensi." },
];

const STEPS = [
  { n: 1, title: "Pilih produk", desc: "Cari atau pilih dari kategori." },
  { n: 2, title: "Masukkan nomor", desc: "Isi nomor tujuan, cek total, lalu beli." },
  { n: 3, title: "Checkout & selesai", desc: "Bayar dan pantau status pesanan." },
];

export default async function HomePage() {
  const cats = await getCatalog();
  return (
    <main id="main" className="wrap pb-5 space-y-8">
      {/* banners */}
      <Reveal as="section" className="grid md:grid-cols-3 gap-4">
        <div
          className="md:col-span-2 rounded-2xl p-7 md:p-10 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(120deg,#4338CA,#1E1B4B)" }}
        >
          <div className="absolute -right-10 -bottom-16 w-72 h-72 rounded-full bg-white/10" />
          <div className="absolute right-12 top-10 hidden md:block text-white/25">
            <Icon name="phone" className="w-36 h-36" />
          </div>
          <p className="text-amber-300 font-bold text-sm">Digital transactions. Simplified.</p>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mt-2 max-w-[520px]">
            Isi pulsa, kuota &amp; bayar tagihan dalam satu tempat
          </h1>
          <p className="mt-3 text-indigo-200 max-w-[440px]">
            Harga jelas, biaya admin terlihat sebelum bayar, dan status transaksi bisa dipantau.
          </p>
          <Link href="/layanan" className="btn-primary inline-block mt-6">
            Belanja Sekarang
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
          <Link
            href="/layanan?c=pln"
            className="rounded-2xl p-5 bg-[color:var(--accent)] text-[color:var(--brand-d)] relative overflow-hidden"
          >
            <div className="absolute right-4 bottom-4 opacity-60 hidden md:block">
              <Icon name="zap" className="w-12 h-12" />
            </div>
            <div className="font-extrabold text-lg">Token PLN</div>
            <div className="text-sm">Mulai 20rb, token langsung dikirim</div>
          </Link>
          <Link
            href="/layanan?c=ewallet"
            className="rounded-2xl p-5 bg-[color:var(--soft)] text-[color:var(--brand-d)] border border-indigo-100 relative overflow-hidden"
          >
            <div className="absolute right-4 bottom-4 opacity-60 hidden md:block">
              <Icon name="wallet" className="w-12 h-12" />
            </div>
            <div className="font-extrabold text-lg">Top Up E-Wallet</div>
            <div className="text-sm">GoPay, OVO, DANA, ShopeePay</div>
          </Link>
        </div>
      </Reveal>

      {/* kategori */}
      <Reveal as="section" className="bg-white rounded-2xl p-5 border border-slate-200">
        <h2 className="font-bold text-lg mb-4">Kategori</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-y-5">
          {Object.entries(cats).map(([k, c]) => (
            <Link key={k} href={`/layanan?c=${k}`} className="cat-ic">
              <span>
                <Icon name={c.ico} className="w-7 h-7" />
              </span>
              {c.name}
            </Link>
          ))}
        </div>
      </Reveal>

      {/* produk */}
      <Reveal as="section">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl">Pilihan Untukmu</h2>
          <Link href="/layanan" className="text-sm font-semibold text-indigo-700">
            Lihat semua →
          </Link>
        </div>
        <ProductGrid />
      </Reveal>

      {/* usp */}
      <Reveal as="section" className="grid md:grid-cols-3 gap-4">
        <h2 className="sr-only">Kenapa membeli di Aventiva</h2>
        {USP.map((u) => (
          <div key={u.title} className="bg-white rounded-2xl p-5 border border-slate-200 flex gap-4">
            <div className="usp-ic">
              <Icon name={u.icon} />
            </div>
            <div>
              <h3 className="font-bold">{u.title}</h3>
              <p className="text-sm text-slate-500">{u.desc}</p>
            </div>
          </div>
        ))}
      </Reveal>

      {/* cara belanja */}
      <Reveal as="section" className="bg-white rounded-2xl p-6 border border-slate-200">
        <h2 className="font-bold text-xl mb-5">Cara Belanja</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {STEPS.map((s) => (
            <div key={s.n} className="flex gap-3">
              <b className="w-9 h-9 shrink-0 rounded-full bg-[color:var(--brand)] text-white grid place-items-center">
                {s.n}
              </b>
              <div>
                <h3 className="font-bold">{s.title}</h3>
                <p className="text-sm text-slate-500">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </main>
  );
}
