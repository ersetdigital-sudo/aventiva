import { NextResponse } from "next/server";
import { ASSET_BUCKET, SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase";

/** Upload gambar QRIS ke Supabase Storage (bucket publik `assets/qris.png`). */
export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024;
const OBJECT = "qris.png";

export async function POST(req: Request) {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_KEY belum di-set di .env.local" },
      { status: 500 },
    );
  }
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json(
      { ok: false, error: "Supabase belum dikonfigurasi (cek .env.local)" },
      { status: 500 },
    );
  }

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ ok: false, error: "Form tidak valid." }, { status: 400 });
  }

  if (String(form.get("key") ?? "") !== adminKey) {
    return NextResponse.json({ ok: false, error: "Kunci admin salah." }, { status: 401 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ ok: false, error: "Pilih gambar QRIS dulu." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ ok: false, error: "File harus berupa gambar." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "Ukuran maksimal 4 MB." }, { status: 400 });
  }

  const body = Buffer.from(await file.arrayBuffer());
  const url = `${SUPABASE_URL}/storage/v1/object/${ASSET_BUCKET}/${OBJECT}?upsert=true`;

  // PUT = timpa objek yang sudah ada; x-upsert mengizinkan tumpang tindih.
  let res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      apikey: SUPABASE_KEY,
      "Content-Type": file.type,
      "x-upsert": "true",
    },
    body,
  });

  // cadangan: metode POST bila proyek menolak PUT
  if (!res.ok) {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_KEY}`,
        apikey: SUPABASE_KEY,
        "Content-Type": file.type,
        "x-upsert": "true",
      },
      body,
    });
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return NextResponse.json(
      { ok: false, error: `Gagal upload (HTTP ${res.status}).`, detail: detail.slice(0, 400) },
      { status: 502 },
    );
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${ASSET_BUCKET}/${OBJECT}?v=${Date.now()}`;
  return NextResponse.json({ ok: true, url: publicUrl });
}
