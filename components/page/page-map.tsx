import Link from "next/link";
import { APP_NAME, APP_SITE_URL } from "@/lib/constants";
import {
  getCafeCoverUrl,
  getCafeGallery,
  getImageUrl,
} from "@/lib/images";
import { getLatestRating } from "@/lib/ratings";
import {
  MapCafeDrawer,
  MapCafeListDrawer,
  MapListButton,
  MapNavMenu,
  MapProvider,
  NaverMap,
  type MapListCafe,
} from "@/components/page/page-map-prop";

import cafes from "@/data/cafe-basic.json";
import cafeDetails from "@/data/cafe-details.json";

// 상세 정보(사진)가 있는 카페만 목록·지도에 보여준다.
const mapCafes: MapListCafe[] = cafes
  .filter((cafe) => cafe.slug in cafeDetails)
  .map((cafe) => {
    const naver = getLatestRating(cafe.slug, "naver");
    const google = getLatestRating(cafe.slug, "google");
    return {
      slug: cafe.slug,
      name: cafe.name,
      types: cafe.type,
      image: getCafeCoverUrl(cafe.slug),
      latitude: cafe.location.latitude,
      longitude: cafe.location.longitude,
      naverRating: naver?.rating ?? null,
      googleRating: google?.rating ?? null,
      reviewCount: (naver?.count ?? 0) + (google?.count ?? 0),
      naverReviewCount: naver?.count ?? 0,
      googleReviewCount: google?.count ?? 0,
      address: cafe.location.address,
      description: cafe.description,
      // 서랍에서 넘겨 볼 사진. 너무 많으면 페이지가 무거워지므로 앞쪽 몇 장만 쓴다.
      photos: getCafeGallery(cafe.slug)
        .slice(0, 6)
        .map((photo) => ({ src: getImageUrl(photo.src), alt: photo.alt })),
    };
  });

// 검색엔진용 구조화 데이터: 지도에 표시하는 카페 목록과 각 상세페이지 주소.
const mapJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: `${APP_NAME} 카페 지도`,
  numberOfItems: mapCafes.length,
  itemListElement: mapCafes.map((cafe, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: cafe.name,
    url: `${APP_SITE_URL}/cafe/${cafe.slug}`,
  })),
};

export function PageMap() {
  return (
    <MapProvider cafes={mapCafes}>
      <main className="relative h-dvh w-full">
        <NaverMap cafes={mapCafes} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(mapJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <h1 className="sr-only">전국 카페 지도 보기</h1>

        {/* 지도·목록은 화면을 눌러야 나타나므로, 검색엔진과 화면 낭독기가 읽을 수 있게
            지도에 표시하는 카페와 상세페이지 링크를 서버 HTML에 함께 넣어 둔다. (화면에는 보이지 않음) */}
        <nav aria-labelledby="map-cafe-links" className="sr-only">
          <h2 id="map-cafe-links">지도에 표시된 카페</h2>
          <ul>
            {mapCafes.map((cafe) => (
              <li key={cafe.slug}>
                <Link href={`/cafe/${cafe.slug}`} prefetch={false}>
                  {cafe.name}
                </Link>
                {` · ${cafe.types.join(", ")} · ${cafe.address}`}
              </li>
            ))}
          </ul>
        </nav>

        {/* 상단 왼쪽: 로고 버튼. 누르면 홈·보기 방식 이동 메뉴가 열린다. */}
        <div className="absolute top-3 left-3 z-20 lg:top-5 lg:left-5">
          <MapNavMenu />
        </div>

        {/* 하단: 정렬 기준 버튼. 누르면 카페 목록이 열린다. (PC: 왼쪽, 모바일: 아래) */}
        <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2">
          <MapListButton />
        </div>

        <MapCafeListDrawer />
        <MapCafeDrawer />
      </main>
    </MapProvider>
  );
}
