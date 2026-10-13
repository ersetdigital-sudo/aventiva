import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { ASSET_BUCKET, createServerSupabase, SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase";

/** Upload gambar QRIS ke Supabase Storage (bucket publik `assets/qris.png`). */
export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024;
const OBJECT = "qris.png";

export async function POST(req: Request) {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_KEY belum di-set di server" },
      { status: 500 },
    );
  }
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json(
      { ok: false, error: "Supabase belum dikonfigurasi (isi kunci lewat Secrets)" },
      { status: 500 },
    );
  }

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ ok: false, error: "Form tidak valid." }, { status: 400 });
  }

  // Otorisasi: sesi panel admin (cookie httpOnly) atau kunci admin dari form.
  const viaSession = await isAdmin();
  if (!viaSession && String(form.get("key") ?? "") !== adminKey) {
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

  const sb = createServerSupabase();
  if (!sb) {
    return NextResponse.json(
      { ok: false, error: "Supabase belum dikonfigurasi (isi kunci lewat Secrets)" },
      { status: 500 },
    );
  }

  // Pakai SDK Storage: ia mengirim kunci format baru (sb_publishable_…/sbp_…)
  // dengan benar. JANGAN kirim kunci ini sebagai `Authorization: Bearer` —
  // Supabase Storage menolaknya sebagai JWT tidak valid.
  const { error } = await sb.storage
    .from(ASSET_BUCKET)
    .upload(OBJECT, await file.arrayBuffer(), {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    return NextResponse.json(
      { ok: false, error: `Gagal upload: ${error.message}` },
      { status: 502 },
    );
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${ASSET_BUCKET}/${OBJECT}?v=${Date.now()}`;
  return NextResponse.json({ ok: true, url: publicUrl });
}
