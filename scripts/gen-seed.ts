/**
 * Generate SQL seed untuk tabel katalog & FAQ dari data statis.
 *
 * Jalankan:   node scripts/gen-seed.ts > supabase/seed.sql
 * (Node 22.18+ / 23.6+ menjalankan .ts langsung tanpa kompilasi.)
 *
 * File ini sengaja di-exclude dari tsconfig supaya impor berekstensi .ts
 * tidak mengganggu build Next.js.
 */
import { CATS } from "../data/categories.ts";
import { FAQ } from "../data/faq.ts";

const q = (s: string) => `'${String(s).replace(/'/g, "''")}'`;
const textArray = (a: string[]) => `array[${a.map(q).join(",")}]::text[]`;

const lines: string[] = [];

lines.push("-- ====================================================================");
lines.push("--  Aventiva Digital — SEED katalog, FAQ, dan pengaturan situs");
lines.push("--  DIBUAT OTOMATIS oleh scripts/gen-seed.ts — jangan edit manual,");
lines.push("--  jalankan ulang skrip itu bila data di data/ berubah.");
lines.push("--  Jalankan di: Dashboard Supabase → SQL Editor (setelah schema.sql)");
lines.push("-- ====================================================================");
lines.push("");
lines.push("begin;");
lines.push("");
lines.push("truncate public.categories, public.products, public.faqs restart identity;");
lines.push("");

/* ---- kategori ---- */
lines.push("-- kategori");
const catRows: string[] = [];
let sort = 0;
for (const [key, c] of Object.entries(CATS)) {
  catRows.push(
    `  (${q(key)}, ${q(c.name)}, ${q(c.ico)}, ${q(c.label)}, ${c.admin}, ${textArray(c.filters)}, ${sort})`,
  );
  sort++;
}
lines.push("insert into public.categories (key, name, ico, label, admin, filters, sort) values");
lines.push(catRows.join(",\n") + ";");
lines.push("");

/* ---- produk ---- */
lines.push("-- produk");
const prodRows: string[] = [];
sort = 0;
for (const [key, c] of Object.entries(CATS)) {
  for (const it of c.items) {
    prodRows.push(
      `  (${q(key)}, ${q(it.n)}, ${q(it.b)}, ${q(it.f)}, ${q(it.d)}, ${it.p}, ${it.o ?? "null"}, ${it.bill ? "true" : "false"}, ${it.soldout ? "true" : "false"}, ${sort})`,
    );
    sort++;
  }
}
lines.push(
  "insert into public.products (cat_key, n, b, f, d, p, o, bill, soldout, sort) values",
);
lines.push(prodRows.join(",\n") + ";");
lines.push("");

/* ---- FAQ ---- */
lines.push("-- FAQ");
const faqRows: string[] = [];
sort = 0;
for (const f of FAQ) {
  faqRows.push(`  (${q(f.cat)}, ${q(f.q)}, ${q(f.a)}, ${sort})`);
  sort++;
}
lines.push("insert into public.faqs (cat, q, a, sort) values");
lines.push(faqRows.join(",\n") + ";");
lines.push("");

lines.push("commit;");
lines.push("");
lines.push(`-- ${Object.keys(CATS).length} kategori, ${prodRows.length} produk, ${FAQ.length} FAQ.`);

console.log(lines.join("\n"));
