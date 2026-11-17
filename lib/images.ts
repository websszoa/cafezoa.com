import { APP_IMAGE_BASE_URL } from "@/lib/constants";
import cafeDetails from "@/data/cafe-details.json";

// 카페 사진 (data/cafe-details.json 의 media.cover, media.gallery)
// 사진 파일은 public/cafe/{slug}-{번호}.webp 이고, GitHub Pages 주소로 불러온다. (서버 트래픽 절약)
//   - cover: 대표 사진. 기본은 {slug}-01.webp
//   - gallery: 상세·사진 페이지에 보여줄 사진 목록. alt에 사진 설명을 쓰면 이미지 검색에 쓰인다.
//     (카페와 관련 없는 워터마크 사진은 gallery에 넣지 않는다)

export type CafePhoto = {
  src: string;
  // 사진 설명 (예: "2층 창가 좌석"). 비어 있으면 화면에서 기본 설명을 만든다.
  alt: string;
};

type CafeMedia = { cover?: string; gallery?: CafePhoto[] };

const mediaBySlug = Object.fromEntries(
  Object.entries(cafeDetails).map(([slug, detail]) => [
    slug,
    detail.media as CafeMedia,
  ]),
) as Record<string, CafeMedia | undefined>;

// "/cafe/x-01.webp" → "https://.../public/cafe/x-01.webp"
export function getImageUrl(path: string) {
  return `${APP_IMAGE_BASE_URL}${path.replace(/^\//, "")}`;
}

// 카페 대표 사진 주소. cover가 없으면 {slug}-01.webp
export function getCafeCoverUrl(slug: string) {
  return getImageUrl(mediaBySlug[slug]?.cover ?? `/cafe/${slug}-01.webp`);
}

// 카페 갤러리 사진 목록. 없으면 빈 배열.
export function getCafeGallery(slug: string): CafePhoto[] {
  return mediaBySlug[slug]?.gallery ?? [];
}
