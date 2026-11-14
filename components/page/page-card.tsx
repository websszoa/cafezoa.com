import { CafeCardGrid } from "@/components/page/page-card-prop";
import { getCafeCoverUrl } from "@/lib/cafe-images";
import { getLatestRating } from "@/lib/ratings";
import cafes from "@/data/cafe-basic.json";
import cafeDetails from "@/data/cafe-details.json";

export function PageCard() {
  return (
    <div className="bg-autumn border-t border-b border-[#ead9ca]/15">
      <main className="px-5 py-12 sm:px-8 sm:py-16">
        <CafeCardGrid
          cafes={cafes.map((cafe) => ({
            slug: cafe.slug,
            name: cafe.name,
            types: cafe.type,
            address: cafe.location.address,
            latitude: cafe.location.latitude,
            longitude: cafe.location.longitude,
            description: cafe.description,
            image: getCafeCoverUrl(cafe.slug),
            naverRating: getLatestRating(cafe.slug, "naver")?.rating ?? null,
            // 상세 정보가 있는 카페만 상세 페이지로 연결한다.
            href: cafe.slug in cafeDetails ? `/cafe/${cafe.slug}` : undefined,
          }))}
        />
      </main>
    </div>
  );
}
