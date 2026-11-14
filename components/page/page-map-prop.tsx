"use client";

import Image from "next/image";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LocationDistance } from "@/components/location/location-distance";
import { useLocation } from "@/components/location/location-provider";
import { APP_IMAGE_BASE_URL } from "@/lib/constants";
import { distanceBetween } from "@/lib/utils";
import {
  ChevronDown,
  Coffee,
  MessageSquare,
  Minus,
  Plus,
  Search,
  Star,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
  type RefObject,
} from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NaverMarker = { setMap: (map: NaverMapInstance | null) => void };

export type NaverMapInstance = {
  fitBounds: (bounds: unknown) => void;
  morph: (coord: unknown, zoom?: number) => void;
  getZoom: () => number;
  setZoom: (zoom: number, useEffect?: boolean) => void;
  setSize: (size: unknown) => void;
  setCenter: (coord: unknown) => void;
};

declare global {
  interface Window {
    naver?: {
      maps: {
        Map: new (
          element: HTMLElement,
          options: { center: unknown; zoom: number },
        ) => NaverMapInstance;
        LatLng: new (lat: number, lng: number) => unknown;
        LatLngBounds: new () => { extend: (latlng: unknown) => void };
        Point: new (x: number, y: number) => unknown;
        Size: new (width: number, height: number) => unknown;
        Event: {
          addListener: (
            target: unknown,
            eventName: string,
            listener: (value: number) => void,
          ) => unknown;
        };
        Marker: new (options: {
          position: unknown;
          map: NaverMapInstance | null;
          title?: string;
          icon?: { content: string; anchor: unknown };
        }) => NaverMarker;
      };
    };
  }
}

// 마커 HTML에 넣는 문자열의 특수문자를 이스케이프한다.
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// 카페 이름 알약과 그 위의 네이버 평점 배지로 이루어진 마커 HTML.
export function getMarkerContent({
  slug,
  name,
  naverRating,
}: Pick<MapListCafe, "slug" | "name" | "naverRating">) {
  const ratingBadge = naverRating !== null ? `★ ${naverRating.toFixed(2)}` : "";

  return `
    <div style="position:relative;display:flex;justify-content:center;width:260px;height:52px;">
      <a href="/cafe/${encodeURIComponent(slug)}" target="_blank" rel="noopener" aria-label="${escapeHtml(name)} 상세페이지를 새 탭에서 열기" style="position:absolute;top:18px;left:50%;height:34px;min-width:max-content;border:2px solid var(--color-bark);border-radius:999px;background:var(--color-leaf);padding:0 14px;color:var(--color-bark);font-size:12px;font-weight:800;line-height:30px;text-align:center;text-decoration:none;white-space:nowrap;transform:translateX(-50%);">
        ${escapeHtml(name)}
      </a>
      ${
        ratingBadge
          ? `<span style="position:absolute;top:0;left:50%;z-index:1;border:2px solid var(--color-bark);border-radius:999px;background:var(--color-autumn);padding:2px 8px;color:white;font-size:10px;font-weight:800;line-height:16px;white-space:nowrap;transform:translateX(-50%);">${ratingBadge}</span>`
          : ""
      }
    </div>
  `;
}

export type MapListCafe = {
  slug: string;
  name: string;
  types: string[];
  image: string;
  latitude: number;
  longitude: number;
  naverRating: number | null;
  googleRating: number | null;
  reviewCount: number;
  address: string;
  // 내 위치에서의 거리(km). 내 위치가 없으면 null. (MapProvider가 브라우저에서 채운다)
  distance?: number | null;
};

// 목록 정렬 기준. 기준마다 비교할 값을 꺼내는 함수를 함께 둔다.
const sortOptions = {
  naver: {
    label: "네이버 평점 높은 순",
    getValue: (cafe: MapListCafe) => cafe.naverRating,
  },
  google: {
    label: "구글 평점 높은 순",
    getValue: (cafe: MapListCafe) => cafe.googleRating,
  },
  review: {
    label: "리뷰 많은 순",
    getValue: (cafe: MapListCafe) => cafe.reviewCount,
  },
  // 값이 클수록 위로 오도록 거리에 -를 붙인다. (가까울수록 큰 값)
  nearby: {
    label: "가까운 순",
    getValue: (cafe: MapListCafe) =>
      cafe.distance == null ? null : -cafe.distance,
  },
};

type SortKey = keyof typeof sortOptions;

// 목록에 보여줄 카페 수.
const LIST_LIMIT = 10;

type MapContextValue = {
  instanceRef: RefObject<NaverMapInstance | null>;
  sort: SortKey;
  setSort: (sort: SortKey) => void;
  query: string;
  setQuery: (query: string) => void;
  sortedCafes: MapListCafe[];
};

// 띄어쓰기·대소문자와 상관없이 비교하도록 검색어와 대상 문자열을 정리한다.
function normalize(value: string) {
  return value.replace(/\s+/g, "").toLowerCase();
}

// 목록·지도·정렬 메뉴가 같은 지도 인스턴스와 정렬 상태를 쓰도록 공유한다.
const MapContext = createContext<MapContextValue | null>(null);

function useMap() {
  const context = useContext(MapContext);
  if (!context) throw new Error("useMap은 MapProvider 안에서 사용해야 합니다.");
  return context;
}

export function MapProvider({
  cafes,
  children,
}: {
  cafes: MapListCafe[];
  children: ReactNode;
}) {
  const instanceRef = useRef<NaverMapInstance | null>(null);
  const [selectedSort, setSelectedSort] = useState<SortKey>("naver");
  const [query, setQuery] = useState("");
  const { location, openDialog } = useLocation();

  // 내 위치가 없으면 "가까운 순"을 쓸 수 없으므로 기본 정렬로 보여준다.
  const sort = selectedSort === "nearby" && !location ? "naver" : selectedSort;

  // "가까운 순"을 골랐는데 내 위치가 없으면 위치 안내 팝업을 연다.
  const setSort = useCallback(
    (next: SortKey) => {
      if (next === "nearby" && !location) openDialog();
      setSelectedSort(next);
    },
    [location, openDialog],
  );

  // 검색어(카페 이름·주소)로 거른 뒤 선택한 기준으로 정렬한 상위 카페. 목록과 지도 마커가 함께 쓴다.
  const sortedCafes = useMemo(() => {
    const { getValue } = sortOptions[sort];
    const keyword = normalize(query);
    return (
      cafes
        .map((cafe) => ({
          ...cafe,
          distance: location
            ? distanceBetween(
                location.latitude,
                location.longitude,
                cafe.latitude,
                cafe.longitude,
              )
            : null,
        }))
        .filter(
          (cafe) =>
            !keyword ||
            normalize(cafe.name).includes(keyword) ||
            normalize(cafe.address).includes(keyword),
        )
        // 값이 없는 카페는 맨 뒤로 보낸다.
        .sort((a, b) => {
          const aValue = getValue(a);
          const bValue = getValue(b);
          if (aValue === null) return bValue === null ? 0 : 1;
          if (bValue === null) return -1;
          return bValue - aValue;
        })
        .slice(0, LIST_LIMIT)
    );
  }, [cafes, sort, query, location]);

  return (
    <MapContext.Provider
      value={{ instanceRef, sort, setSort, query, setQuery, sortedCafes }}
    >
      {children}
    </MapContext.Provider>
  );
}

// 카페 이름·지역 검색창. 엔터를 치면 목록과 지도 마커가 검색 결과로 바뀐다.
export function MapSearch() {
  const { setQuery } = useMap();
  const [value, setValue] = useState("");

  return (
    <div role="search" className="relative min-w-0 flex-1 lg:mt-4">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-stone-500"
      />
      <input
        aria-label="카페 검색"
        placeholder="카페 이름, 지역으로 검색"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          // 한글 조합 중에 누른 엔터는 무시한다. (조합 완료 엔터로 두 번 검색되는 것 방지)
          if (event.key === "Enter" && !event.nativeEvent.isComposing) {
            setQuery(value);
          }
        }}
        className="w-full rounded-full border-2 border-bark bg-white py-2.5 pr-10 pl-10 text-sm text-bark shadow-[3px_3px_0_var(--color-bark)] outline-none placeholder:text-stone-400"
      />
    </div>
  );
}

// 정렬 기준 선택 메뉴. 트리거 모양과 메뉴가 열리는 방향만 바꿔서 PC 목록 제목과 모바일 하단에 함께 쓴다.
export function MapSortMenu({
  trigger,
  side = "bottom",
  align = "start",
}: {
  trigger: ComponentProps<typeof DropdownMenuTrigger>["render"];
  side?: "top" | "bottom";
  align?: "start" | "center";
}) {
  const { sort, setSort } = useMap();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger}>
        {sortOptions[sort].label}
        <ChevronDown aria-hidden="true" className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={side}
        align={align}
        sideOffset={8}
        className="w-52 rounded-2xl border-2 border-bark bg-white p-1.5 shadow-[3px_3px_0_var(--color-bark)] ring-0"
      >
        <DropdownMenuRadioGroup
          value={sort}
          onValueChange={(value) => setSort(value as SortKey)}
        >
          {(Object.keys(sortOptions) as SortKey[]).map((key) => (
            <DropdownMenuRadioItem
              key={key}
              value={key}
              closeOnClick
              className="rounded-xl py-2 text-bark focus:bg-cream focus:text-bark data-checked:font-bold data-checked:text-autumn"
            >
              {sortOptions[key].label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// 클릭하면 지도를 해당 카페 위치로 부드럽게 이동시키는 목록 버튼.
export function MapFocusButton({
  latitude,
  longitude,
  ...props
}: ComponentProps<typeof Button> & { latitude: number; longitude: number }) {
  const { instanceRef } = useMap();

  function handleClick() {
    const naver = window.naver;
    const map = instanceRef.current;
    if (!naver || !map) return;
    map.morph(new naver.maps.LatLng(latitude, longitude), 16);
  }

  return <Button {...props} onClick={handleClick} />;
}

// 내 위치 마커: 주황 테두리의 흰 점과 퍼지는 원.
// 내 위치 마커에 쓰는 얼굴 이미지 수. (public/face/face01.webp ~ face10.webp)
const FACE_COUNT = 10;

// 내 위치 마커의 펄스 애니메이션. 마커 HTML 안에 같이 넣어 지도 라이브러리가 그린 요소에도 바로 적용되게 한다.
// 주황 원 두 개가 1초 간격으로 커지면서 사라져 "두근두근" 퍼지는 느낌을 낸다.
const MY_LOCATION_STYLE = `
  <style>
    @keyframes cafezoa-location-pulse {
      0% { transform: scale(1); opacity: 0.7; }
      100% { transform: scale(1.8); opacity: 0; }
    }
    .cafezoa-location-pulse {
      position: absolute;
      inset: 0;
      border-radius: 999px;
      background: rgba(255, 91, 32, 0.35);
      border: 2px solid rgba(255, 91, 32, 0.6);
      animation: cafezoa-location-pulse 2s cubic-bezier(0.2, 0.6, 0.4, 1) infinite;
    }
    .cafezoa-location-pulse + .cafezoa-location-pulse {
      animation-delay: 1s;
    }
    @media (prefers-reduced-motion: reduce) {
      .cafezoa-location-pulse { animation: none; opacity: 0.3; transform: scale(1.2); }
    }
  </style>
`;

// 내 위치 마커 HTML: face 폴더의 얼굴 이미지를 연분홍 배경 원에 넣고, 뒤에서 주황 원이 펄스처럼 퍼진다.
function getMyLocationMarker(face: number) {
  const src = `${APP_IMAGE_BASE_URL}face/face${String(face).padStart(2, "0")}.webp`;
  return `
    ${MY_LOCATION_STYLE}
    <div style="position:relative;width:40px;height:40px;">
      <span class="cafezoa-location-pulse"></span>
      <span class="cafezoa-location-pulse"></span>
      <img src="${src}" alt="내 위치" width="40" height="40" style="position:absolute;inset:0;width:40px;height:40px;border:3px solid var(--color-autumn);border-radius:999px;background:#ffe4ec;object-fit:cover;" />
    </div>
  `;
}

// 네이버 지도를 화면 가득 그리고, 선택한 정렬 기준의 상위 카페 위치에 마커를 표시한다.
export function NaverMap({ cafes }: { cafes: MapListCafe[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef(new Map<string, NaverMarker>());
  const { instanceRef, sort, sortedCafes } = useMap();
  const { location } = useLocation();
  const myMarkerRef = useRef<NaverMarker | null>(null);
  // 지도 페이지를 열 때마다 얼굴 이미지를 하나 랜덤으로 고른다. (페이지에 있는 동안은 그대로)
  const faceRef = useRef<number | null>(null);
  // 마지막으로 지도 범위를 맞춘 정렬 기준. 검색어만 바뀌었을 때는 범위를 다시 맞추지 않는다.
  const fittedSortRef = useRef<SortKey | null>(null);
  const [zoom, setZoom] = useState<number | null>(null);

  // 지도 스크립트가 준비되면 호출된다. 실제 생성은 지도 영역 크기가 정해진 뒤에 한다.
  function initMap() {
    const naver = window.naver;
    if (!naver || !mapRef.current || instanceRef.current) return;

    // 지도 영역 크기가 0이면(CSS 적용 전 등) 그 크기로 그려져 일부가 회색으로 남는다.
    // 이때는 만들지 않고, 아래 ResizeObserver가 크기가 생겼을 때 다시 부른다.
    const { width, height } = mapRef.current.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    const map = new naver.maps.Map(mapRef.current, {
      center: new naver.maps.LatLng(37.5665, 126.978),
      zoom: 12,
    });
    instanceRef.current = map;

    // 마커는 처음에 한 번만 만들어 두고, 정렬 기준이 바뀌면 보이기/숨기기만 한다.
    markersRef.current.clear();
    cafes.forEach((cafe) => {
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(cafe.latitude, cafe.longitude),
        map: null,
        title: cafe.name,
        icon: {
          content: getMarkerContent(cafe),
          anchor: new naver.maps.Point(130, 52),
        },
      });
      markersRef.current.set(cafe.slug, marker);
    });

    // 지도 레벨이 바뀔 때마다 화면 표시를 갱신한다.
    setZoom(map.getZoom());
    naver.maps.Event.addListener(map, "zoom_changed", setZoom);
  }

  const initMapOnResize = useEffectEvent(initMap);

  // 지도 영역 크기가 바뀌면(첫 크기 확정, 창 크기·모바일 주소창 변화) 지도에 새 크기를 알려 회색 영역이 남지 않게 한다.
  useEffect(() => {
    const element = mapRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      const naver = window.naver;
      const map = instanceRef.current;
      const { width, height } = entry.contentRect;
      if (!naver || width === 0 || height === 0) return;

      if (map) map.setSize(new naver.maps.Size(width, height));
      else initMapOnResize();
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [instanceRef]);

  // 정렬 기준·검색어에 맞는 카페 마커만 보여준다.
  // 처음 열 때와 정렬 기준이 바뀔 때만 마커들이 한 화면에 들어오도록 범위를 맞추고, 검색할 때는 지도 레벨을 그대로 둔다.
  useEffect(() => {
    const naver = window.naver;
    const map = instanceRef.current;
    if (!naver || !map || zoom === null) return;

    const visible = new Set(sortedCafes.map((cafe) => cafe.slug));
    markersRef.current.forEach((marker, slug) => {
      marker.setMap(visible.has(slug) ? map : null);
    });

    if (fittedSortRef.current === sort || sortedCafes.length === 0) return;
    fittedSortRef.current = sort;
    const bounds = new naver.maps.LatLngBounds();
    sortedCafes.forEach((cafe) => {
      bounds.extend(new naver.maps.LatLng(cafe.latitude, cafe.longitude));
    });
    // 가까운 순일 때는 내 위치도 함께 보이도록 범위에 넣는다.
    if (sort === "nearby" && location) {
      bounds.extend(
        new naver.maps.LatLng(location.latitude, location.longitude),
      );
    }
    map.fitBounds(bounds);
    // 지도 레벨(zoom)이 바뀔 때는 다시 맞추지 않도록, 지도 준비 여부만 의존성으로 쓴다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedCafes, zoom === null]);

  // 내 위치가 있으면 지도에 내 위치 마커를 표시한다. 위치가 바뀌면 새 위치로 옮긴다.
  useEffect(() => {
    const naver = window.naver;
    const map = instanceRef.current;
    if (!naver || !map || zoom === null) return;

    myMarkerRef.current?.setMap(null);
    faceRef.current ??= Math.floor(Math.random() * FACE_COUNT) + 1;
    myMarkerRef.current = location
      ? new naver.maps.Marker({
          position: new naver.maps.LatLng(
            location.latitude,
            location.longitude,
          ),
          map,
          title: "내 위치",
          icon: {
            content: getMyLocationMarker(faceRef.current),
            anchor: new naver.maps.Point(20, 20),
          },
        })
      : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, zoom === null]);

  return (
    <>
      <Script
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`}
        onReady={initMap}
      />
      <div ref={mapRef} className="size-full" />
      {zoom !== null && (
        <div className="absolute top-4 right-4 z-20 hidden items-center gap-1 rounded-full border-2 border-bark bg-white p-1 text-xs font-bold text-bark shadow-[3px_3px_0_var(--color-bark)] lg:flex">
          <Button
            variant="ghost"
            size="icon"
            aria-label="지도 축소"
            onClick={() => instanceRef.current?.setZoom(zoom - 1, true)}
            className="size-7 rounded-full text-bark hover:bg-cream hover:text-autumn"
          >
            <Minus className="size-4" />
          </Button>
          <span className="px-1">
            <span className="text-autumn">{zoom}</span>
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="지도 확대"
            onClick={() => instanceRef.current?.setZoom(zoom + 1, true)}
            className="size-7 rounded-full text-bark hover:bg-cream hover:text-autumn"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      )}
    </>
  );
}

// 정렬 기준을 고르는 목록 제목과, 그 기준으로 정렬한 상위 카페 목록. (PC 전용)
export function MapCafeList() {
  const { sort, sortedCafes } = useMap();

  return (
    <div className="hidden min-h-0 flex-1 flex-col lg:flex">
      <div className="flex shrink-0 items-center justify-between px-5 pt-4 pb-1">
        <MapSortMenu
          trigger={
            <button className="font-paperlogy flex items-center gap-1 rounded-full text-base font-semibold text-bark outline-none hover:text-autumn focus-visible:ring-2 focus-visible:ring-autumn" />
          }
        />
        <span className="rounded-full bg-autumn px-2.5 py-0.5 text-xs font-bold text-white">
          TOP {LIST_LIMIT}
        </span>
      </div>

      <ScrollArea className="min-h-0 flex-1 **:data-[slot=scroll-area-thumb]:bg-transparent">
        <div className="space-y-2 p-3">
          {sortedCafes.length === 0 && (
            <p className="py-10 text-center text-sm text-stone-500">
              검색 결과가 없어요.
            </p>
          )}
          {sortedCafes.map((cafe, index) => (
            <article
              key={cafe.slug}
              className="rounded-2xl bg-white transition hover:bg-[#fffaf2]"
            >
              <MapFocusButton
                latitude={cafe.latitude}
                longitude={cafe.longitude}
                variant="ghost"
                className="h-auto w-full justify-start gap-3 rounded-2xl bg-transparent p-3 text-left whitespace-normal hover:bg-transparent"
              >
                <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-stone-200">
                  <Image
                    src={cafe.image}
                    alt={`${cafe.name} 대표 사진`}
                    fill
                    sizes="64px"
                    loading={index === 0 ? "eager" : "lazy"}
                    className="object-cover"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-paperlogy block truncate text-base font-semibold text-bark">
                    {cafe.name}
                  </span>
                  <span className="mt-1 flex items-center gap-1 truncate text-xs text-stone-600">
                    <Coffee
                      aria-hidden="true"
                      className="size-3.5 shrink-0 text-autumn"
                    />
                    {cafe.types.slice(0, 3).join(" · ")}
                  </span>
                  <span className="mt-1.5 flex items-center gap-2 text-xs font-bold text-[#795f55]">
                    {sort === "review" ? (
                      <span className="flex items-center gap-1">
                        <MessageSquare
                          aria-hidden="true"
                          className="size-3 fill-autumn text-autumn"
                        />
                        리뷰 {cafe.reviewCount.toLocaleString()}
                      </span>
                    ) : (
                      (sort === "google"
                        ? cafe.googleRating
                        : cafe.naverRating) !== null && (
                        <span className="flex items-center gap-1">
                          <Star
                            aria-hidden="true"
                            className="size-3.5 fill-autumn text-autumn"
                          />
                          {(sort === "google"
                            ? cafe.googleRating
                            : cafe.naverRating)!.toFixed(2)}
                        </span>
                      )
                    )}
                    <LocationDistance
                      latitude={cafe.latitude}
                      longitude={cafe.longitude}
                      className="text-autumn"
                    />
                  </span>
                </span>
              </MapFocusButton>
            </article>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
