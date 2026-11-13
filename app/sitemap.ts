import type { MetadataRoute } from "next";
import { APP_SITE_URL } from "@/lib/constants";

import cafeDetails from "@/data/cafe-details.json";

const routes = [
  "",
  "/map",
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
  // 상세 정보가 있는 카페의 상세 페이지 (/cafe/{slug})
  const cafeRoutes = Object.keys(cafeDetails).map((slug) => `/cafe/${slug}`);

  return [...routes, ...cafeRoutes].map((route) => ({
    url: `${APP_SITE_URL}${route}`,
  }));
}
