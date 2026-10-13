import { NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_SESSION_MAX_AGE, sessionToken, verifyPassword } from "@/lib/admin-auth";

export const runtime = "nodejs";

/** POST { password } → set cookie sesi httpOnly bila kata sandi cocok. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { password?: string } | null;
  const token = sessionToken();

  if (!token) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_KEY belum di-set di server." },
      { status: 500 },
    );
  }

  if (!verifyPassword(String(body?.password ?? ""))) {
    return NextResponse.json({ ok: false, error: "Kata sandi salah." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: ADMIN_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
  return res;
}
