import type { Metadata } from "next";
import { APP_IMAGE_BASE_URL, APP_NAME, APP_SLOGAN } from "@/lib/constants";

// 사이트 대표 공유 이미지 (카톡·SNS 미리보기)
export const DEFAULT_OG_IMAGE = {
  url: `${APP_IMAGE_BASE_URL}cafezoa.png`,
  width: 1536,
  height: 1024,
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
