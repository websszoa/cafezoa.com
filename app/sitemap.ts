import type { MetadataRoute } from "next";
import { APP_SITE_URL } from "@/lib/constants";
import { getCafeGallery, getImageUrl } from "@/lib/cafe-images";

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
  const pages = routes.map((route) => ({ url: `${APP_SITE_URL}${route}` }));

  // 상세 정보가 있는 카페의 상세 페이지 (/cafe/{slug})
  // 갤러리 사진도 함께 알려서 이미지 검색에 카페 사진이 잡히게 한다.
  const cafePages = Object.keys(cafeDetails).map((slug) => ({
    url: `${APP_SITE_URL}/cafe/${slug}`,
    images: getCafeGallery(slug).map((photo) => getImageUrl(photo.src)),
  }));

  return [...pages, ...cafePages];
}
