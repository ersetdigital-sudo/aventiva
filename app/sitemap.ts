import type { MetadataRoute } from "next";
import { CAT_KEYS } from "@/data/categories";
import { SITE } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages = ["", "/layanan", "/cek-transaksi", "/bantuan"].map((p) => ({
    url: `${SITE.url}${p}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));

  const categoryPages = CAT_KEYS.map((k) => ({
    url: `${SITE.url}/layanan?c=${k}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages];
}
