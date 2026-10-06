import type { MetadataRoute } from "next";
import { APP_SITE_URL } from "@/lib/constants";
import { cafes } from "@/lib/utils";

const lastModified = new Date("2026-10-07T00:00:00+09:00");

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { path: "", priority: 1 },
    { path: "/blog", priority: 0.9 },
    { path: "/map", priority: 0.8 },
    { path: "/list", priority: 0.8 },
    { path: "/gallery", priority: 0.8 },
  ].map(({ path, priority }) => ({
    url: `${APP_SITE_URL}${path}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority,
  }));

  const cafePages: MetadataRoute.Sitemap = cafes.map((cafe) => ({
    url: `${APP_SITE_URL}/cafe/${cafe.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.9,
    images: [cafe.thumbnail, ...cafe.galleryImages].map(
      (image) => `${APP_SITE_URL}${image}`,
    ),
  }));

  return [...staticPages, ...cafePages];
}
