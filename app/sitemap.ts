import type { MetadataRoute } from "next";
import { APP_SITE_URL } from "@/lib/constants";

const routes = [
  "",
  "/card",
  "/list",
  "/gallery",
  "/about",
  "/support",
  "/policy",
  "/terms",
  "/privacy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${APP_SITE_URL}${route}`,
  }));
}
