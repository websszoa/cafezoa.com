import { CafeCardGrid } from "@/components/page/page-card-prop";
import { APP_IMAGE_BASE_URL } from "@/lib/constants";
import cafes from "@/data/cafe-basic.json";

// 월(YYYY-MM)별 평점 기록. 각 값은 [평점, 리뷰 수] 형태이며, 플랫폼마다 기록된 달이 다를 수 있다.
type Ratings = Record<string, { naver?: number[]; google?: number[] }>;

// GitHub Pages에 올라간 카페 대표 이미지 주소. (예: .../public/cafe/{slug}-02.webp)
function getCafeImage(slug: string) {
  return `${APP_IMAGE_BASE_URL}cafe/${slug}-02.webp`;
}

// 네이버 평점이 있는 가장 최근 달의 평점을 돌려준다. 평점 데이터가 없으면 null.
function getLatestNaverRating(ratings: Ratings | undefined) {
  if (!ratings) return null;
  const month = Object.keys(ratings)
    .sort()
    .reverse()
    .find((key) => ratings[key].naver);
  return month ? ratings[month].naver![0] : null;
}

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
            description: cafe.description,
            image: getCafeImage(cafe.slug),
            naverRating: getLatestNaverRating(cafe.ratings as Ratings),
          }))}
        />
      </main>
    </div>
  );
}
