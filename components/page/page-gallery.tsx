import {
  GalleryGrid,
  type GalleryImage,
} from "@/components/page/page-gallery-prop";
import { APP_IMAGE_BASE_URL } from "@/lib/constants";
import cafes from "@/data/cafe-basic.json";
import cafeDetails from "@/data/cafe-details.json";

type CafeDetail = (typeof cafeDetails)[keyof typeof cafeDetails];

// 이미지 경로를 숫자로 바꿔 서버·브라우저에서 같은 랜덤형 순서를 만든다.
function randomRank(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// 각 카페 갤러리 사진(마지막 한 장 제외)을 섞어서 한 목록으로 만든다.
const galleryImages: GalleryImage[] = cafes
  .flatMap((cafe) => {
    const detail = (cafeDetails as Record<string, CafeDetail>)[cafe.slug];
    if (!detail) return [];

    return detail.media.gallery.slice(0, -1).map((path) => ({
      src: `${APP_IMAGE_BASE_URL}${path.replace(/^\//, "")}`,
      rank: randomRank(path),
      slug: cafe.slug,
      name: cafe.name,
      province: cafe.location.address.split(" ")[0],
      features: detail.features,
    }));
  })
  .sort((a, b) => a.rank - b.rank);

export function PageGallery() {
  return (
    <div className="bg-autumn border-t border-b border-[#ead9ca]/15">
      <main className="px-5 py-12 sm:px-8 sm:py-16">
        <GalleryGrid images={galleryImages} />
      </main>
    </div>
  );
}
