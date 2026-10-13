import type { NextConfig } from "next";

/**
 * Origin allowlist for dev assets/HMR.
 *
 * Only used inside the Base44 sandbox (BASE44_PREVIEW_MODE=1): the preview is
 * reached through a proxy at `https://3000-<BASE44_PUBLIC_HOST_SUFFIX>`, so the
 * browser sends that Origin. With the flag unset this stays empty and Next
 * behaves exactly as before (localhost only).
 */
const previewOrigins =
  process.env.BASE44_PREVIEW_MODE === "1" && process.env.BASE44_PUBLIC_HOST_SUFFIX
    ? [`3000-${process.env.BASE44_PUBLIC_HOST_SUFFIX}`]
    : [];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(previewOrigins.length > 0 ? { allowedDevOrigins: previewOrigins } : {}),
};

export default nextConfig;
