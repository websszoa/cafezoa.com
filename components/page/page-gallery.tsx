import { getCafeGallery, getImageUrl } from "@/lib/cafe-images";
import cafes from "@/data/cafe-basic.json";
import cafeDetails from "@/data/cafe-details.json";
import {
  GalleryGrid,
  type GalleryImage,
} from "@/components/page/page-gallery-prop";

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

// 각 카페 갤러리 사진을 섞어서 한 목록으로 만든다.
const galleryImages: GalleryImage[] = cafes
  .flatMap((cafe) => {
    const detail = (cafeDetails as Record<string, CafeDetail>)[cafe.slug];
    if (!detail) return [];

    return getCafeGallery(cafe.slug).map((photo) => ({
      src: getImageUrl(photo.src),
      alt: photo.alt,
      rank: randomRank(photo.src),
      slug: cafe.slug,
      name: cafe.name,
      province: cafe.location.address.split(" ")[0],
      latitude: cafe.location.latitude,
      longitude: cafe.location.longitude,
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
