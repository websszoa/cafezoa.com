import type { MetadataRoute } from "next";
import { APP_SITE_URL } from "@/lib/constants";
import { getCafeGallery, getImageUrl } from "@/lib/images";
import { getLastRatedDate } from "@/lib/ratings";

import cafeDetails from "@/data/cafe-details.json";

// 카페 목록·평점을 보여주는 페이지. 카페 정보가 바뀌면 함께 바뀌므로 가장 최근 카페 수정일을 쓴다.
const cafeListRoutes = ["", "/map", "/card", "/list", "/gallery"];

// 소개·정책 페이지. 실제 수정일을 알 수 없으므로 lastmod를 넣지 않는다. (틀린 날짜보다 없는 편이 낫다)
const staticRoutes = ["/about", "/support", "/policy", "/terms", "/privacy"];

export default function sitemap(): MetadataRoute.Sitemap {
  // 상세 정보가 있는 카페의 상세 페이지 (/cafe/{slug})
  // 갤러리 사진도 함께 알려서 이미지 검색에 카페 사진이 잡히게 한다.
  // lastmod는 평점을 마지막으로 갱신한 날이다. (상세페이지에 평점이 표시됨)
  const cafePages = Object.keys(cafeDetails).map((slug) => ({
    url: `${APP_SITE_URL}/cafe/${slug}`,
    lastModified: getLastRatedDate(slug),
    images: getCafeGallery(slug).map((photo) => getImageUrl(photo.src)),
  }));

  const latestCafeDate = cafePages
    .map((page) => page.lastModified)
    .filter((date): date is string => !!date)
    .sort()
    .at(-1);

  const listPages = cafeListRoutes.map((route) => ({
    url: `${APP_SITE_URL}${route}`,
    lastModified: latestCafeDate,
  }));
  const otherPages = staticRoutes.map((route) => ({
    url: `${APP_SITE_URL}${route}`,
  }));

  return [...listPages, ...otherPages, ...cafePages];
}
