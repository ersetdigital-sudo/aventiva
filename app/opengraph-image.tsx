import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Aventiva Digital — Pulsa, Data, Token PLN & Tagihan";

/** Kartu Open Graph otomatis (dibuat saat build, memakai font lokal). */
export default async function OpengraphImage() {
  const [bold, extrabold] = await Promise.all([
    readFile(path.join(process.cwd(), "public/fonts/plusjakartasans-bold.ttf")),
    readFile(path.join(process.cwd(), "public/fonts/plusjakartasans-extrabold.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(120deg,#4338CA,#1E1B4B)",
          color: "#ffffff",
          padding: "72px",
          fontFamily: "Jakarta",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 44, fontWeight: 800 }}>
          aventiva<span style={{ color: "#FDB022" }}>.</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: "#FCD34D" }}>
            Digital transactions. Simplified.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.1,
              marginTop: 16,
              maxWidth: 900,
            }}
          >
            Isi pulsa, kuota &amp; bayar tagihan dalam satu tempat
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              background: "#FDB022",
              color: "#1E1B4B",
              fontSize: 28,
              fontWeight: 700,
              padding: "16px 28px",
              borderRadius: 16,
            }}
          >
            Pulsa · Paket Data · Token PLN · E-Wallet · Tagihan
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: [
      { name: "Jakarta", data: bold, weight: 700 as const },
      { name: "Jakarta", data: extrabold, weight: 800 as const },
    ] },
  );
}
