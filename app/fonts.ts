import localFont from "next/font/local";

/** Plus Jakarta Sans (file lokal, bobot normal 200–800). */
export const jakarta = localFont({
  src: [
    { path: "../public/fonts/plusjakartasans-extralight.ttf", weight: "200", style: "normal" },
    { path: "../public/fonts/plusjakartasans-light.ttf", weight: "300", style: "normal" },
    { path: "../public/fonts/plusjakartasans-regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/plusjakartasans-medium.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/plusjakartasans-semibold.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/plusjakartasans-bold.ttf", weight: "700", style: "normal" },
    { path: "../public/fonts/plusjakartasans-extrabold.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-jakarta",
  display: "swap",
  preload: false,
});
