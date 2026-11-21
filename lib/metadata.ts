import type { Metadata } from "next";
import {
  APP_IMAGE_BASE_URL,
  APP_NAME,
  APP_SITE_URL,
  APP_SLOGAN,
} from "@/lib/constants";

import cafes from "@/data/cafe-basic.json";
import cafeDetails from "@/data/cafe-details.json";

// 사이트 대표 공유 이미지 (카톡·SNS 미리보기). 공유 미리보기 표준 크기 1200×630, WebP 약 54KB.
export const DEFAULT_OG_IMAGE = {
  url: `${APP_IMAGE_BASE_URL}cafezoa.webp`,
  width: 1200,
  height: 630,
  type: "image/webp",
  alt: `${APP_NAME} - ${APP_SLOGAN}`,
};

// 페이지별 메타데이터를 만든다. (제목·설명·canonical·공유 미리보기)
// openGraph·twitter는 루트 값과 합쳐지지 않고 통째로 바뀌므로, 페이지마다 이 함수로
// 직접 채워야 공유할 때 홈 제목·주소가 아니라 해당 페이지 정보가 나온다.
export function createPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  // "/about" 처럼 슬래시로 시작하는 경로
  path: string;
}): Metadata {
  // 공유 미리보기 제목에도 사이트 이름을 붙인다. (title.template은 <title>에만 적용됨)
  const shareTitle = `${title} | ${APP_NAME}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "ko_KR",
      siteName: APP_NAME,
      url: path,
      title: shareTitle,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  };
}

// 카페 목록 페이지(카드·목록·이미지)의 구조화 데이터: 상세페이지가 있는 카페와 그 주소 목록.
// 검색엔진이 목록 페이지와 각 카페 상세페이지의 관계를 이해하도록 돕는다.
export function createCafeItemListJsonLd(name: string) {
  const items = cafes.filter((cafe) => cafe.slug in cafeDetails);
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${APP_NAME} ${name}`,
    numberOfItems: items.length,
    itemListElement: items.map((cafe, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: cafe.name,
      url: `${APP_SITE_URL}/cafe/${cafe.slug}`,
    })),
  };
}
