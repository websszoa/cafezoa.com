import Link from "next/link";
import { MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCafeCoverUrl } from "@/lib/cafe-images";
import { getLatestRating } from "@/lib/ratings";
import {
  MapCafeList,
  MapProvider,
  MapSearch,
  MapSortMenu,
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
      address: cafe.location.address,
    };
  });

export function PageMap() {
  return (
    <MapProvider cafes={mapCafes}>
      <main className="relative h-dvh w-full">
        <NaverMap cafes={mapCafes} />

        <aside
          aria-label="카페 목록"
          className="absolute top-2 right-2 left-2 z-20 flex flex-col overflow-hidden rounded-2xl lg:inset-y-4 lg:right-auto lg:left-4 lg:w-[min(23rem,calc(100vw-2rem))] lg:rounded-3xl lg:bg-cream/95 lg:backdrop-blur-md"
        >
          <div className="flex shrink-0 items-center gap-3 p-3 lg:block lg:border-b lg:border-[#ead9ca] lg:px-5 lg:pt-5 lg:pb-4">
            <div className="flex shrink-0 items-center gap-3">
              <Button
                render={<Link href="/" />}
                nativeButton={false}
                variant="sprout"
                size="icon"
                aria-label="홈으로 이동"
                className="size-11 bg-leaf p-0 text-bark hover:bg-leaf-dark"
              >
                <MapPinned className="size-5" />
              </Button>
              <div className="hidden lg:block">
                <h1 className="font-paperlogy text-xl font-semibold text-bark">
                  지도 보기
                </h1>
                <p className="text-sm text-stone-500">
                  지도에서 취향에 맞는 카페를 찾아보세요.
                </p>
              </div>
            </div>

            <MapSearch />
          </div>

          <MapCafeList />
        </aside>

        <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 lg:hidden">
          <MapSortMenu
            side="top"
            align="center"
            trigger={
              <Button
                variant="seed"
                className="h-10 bg-white text-bark hover:bg-cream"
              />
            }
          />
        </div>
      </main>
    </MapProvider>
  );
}
