"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { LocationDistance } from "@/components/location/location-distance";
import { useLocation } from "@/components/location/location-provider";
import { APP_IMAGE_BASE_URL } from "@/lib/constants";
import { introLinks } from "@/lib/menu";
import { distanceBetween } from "@/lib/utils";
import {
  ArrowRight,
  ChevronDown,
  Coffee,
  House,
  List,
  MapPinned,
  MessageSquare,
  Minus,
  Plus,
  Search,
  Star,
  X,
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
  useSyncExternalStore,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";

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
          // 값이 클수록 다른 마커보다 위에 그려진다.
          zIndex?: number;
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
// link가 true면 상세페이지 링크(새 탭)로, false면 지도 페이지의 서랍을 여는 버튼(data-cafe-slug)으로 그린다.
export function getMarkerContent(
  {
    slug,
    name,
    naverRating,
  }: Pick<MapListCafe, "slug" | "name" | "naverRating">,
  { link = true }: { link?: boolean } = {},
) {
  const ratingBadge = naverRating !== null ? `★ ${naverRating.toFixed(2)}` : "";
  const pillStyle =
    "position:absolute;top:18px;left:50%;height:34px;min-width:max-content;border:2px solid var(--color-bark);border-radius:999px;background:var(--color-leaf);padding:0 14px;color:var(--color-bark);font-family:inherit;font-size:12px;font-weight:800;line-height:30px;text-align:center;text-decoration:none;white-space:nowrap;transform:translateX(-50%);cursor:pointer;pointer-events:auto;";
  const pill = link
    ? `<a href="/cafe/${encodeURIComponent(slug)}" target="_blank" rel="noopener" aria-label="${escapeHtml(name)} 상세페이지를 새 탭에서 열기" style="${pillStyle}">${escapeHtml(name)}</a>`
    : `<button type="button" data-cafe-slug="${escapeHtml(slug)}" aria-label="${escapeHtml(name)} 정보 보기" style="${pillStyle}">${escapeHtml(name)}</button>`;

  return `
    <div style="position:relative;display:flex;justify-content:center;width:260px;height:52px;pointer-events:none;">
      ${pill}
      ${
        ratingBadge
          ? `<span style="position:absolute;top:0;left:50%;z-index:1;border:2px solid var(--color-bark);border-radius:999px;background:var(--color-autumn);padding:2px 8px;color:white;font-size:10px;font-weight:800;line-height:16px;white-space:nowrap;transform:translateX(-50%);pointer-events:none;">${ratingBadge}</span>`
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
  // 출처별 리뷰 수 (서랍의 평점 줄에 쓴다)
  naverReviewCount: number;
  googleReviewCount: number;
  address: string;
  // 서랍에 보여줄 소개글과 사진(전체 주소)
  description: string;
  photos: { src: string; alt: string }[];
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

// 목록에 보여줄 카페 수. "TOP 10" 버튼을 누르면 TOP 20으로, 다시 누르면 TOP 10으로 바뀐다.
const LIST_LIMITS = [10, 20] as const;
type ListLimit = (typeof LIST_LIMITS)[number];

type MapContextValue = {
  instanceRef: RefObject<NaverMapInstance | null>;
  sort: SortKey;
  setSort: (sort: SortKey) => void;
  query: string;
  setQuery: (query: string) => void;
  sortedCafes: MapListCafe[];
  listLimit: ListLimit;
  toggleListLimit: () => void;
  // 마커를 눌러 서랍에 보여줄 카페. 서랍이 닫히는 애니메이션 동안 내용이 남도록 open과 따로 둔다.
  selectedCafe: MapListCafe | null;
  drawerOpen: boolean;
  openCafe: (slug: string) => void;
  setDrawerOpen: (open: boolean) => void;
  // 하단 정렬 버튼으로 여는 카페 목록 서랍 (PC: 왼쪽, 모바일: 아래)
  listOpen: boolean;
  setListOpen: (open: boolean) => void;
  isDesktop: boolean;
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
  const [listLimit, setListLimit] = useState<ListLimit>(LIST_LIMITS[0]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const { location, openDialog } = useLocation();
  const isDesktop = useIsDesktop();

  // 카페 상세 서랍을 연다. 모바일은 화면이 좁아 목록 서랍과 겹치므로 목록을 닫는다.
  const openCafe = useCallback(
    (slug: string) => {
      setSelectedSlug(slug);
      setDrawerOpen(true);
      if (!isDesktop) setListOpen(false);
    },
    [isDesktop],
  );

  const toggleListLimit = useCallback(
    () =>
      setListLimit((limit) =>
        limit === LIST_LIMITS[0] ? LIST_LIMITS[1] : LIST_LIMITS[0],
      ),
    [],
  );

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
        .slice(0, listLimit)
    );
  }, [cafes, sort, query, location, listLimit]);

  const selectedCafe = useMemo(
    () => cafes.find((cafe) => cafe.slug === selectedSlug) ?? null,
    [cafes, selectedSlug],
  );

  return (
    <MapContext.Provider
      value={{
        instanceRef,
        sort,
        setSort,
        query,
        setQuery,
        sortedCafes,
        listLimit,
        toggleListLimit,
        selectedCafe,
        drawerOpen,
        openCafe,
        setDrawerOpen,
        listOpen,
        setListOpen,
        isDesktop,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

// 카페 이름·지역 검색창. 엔터를 치면 목록과 지도 마커가 검색 결과로 바뀐다.
function MapSearch() {
  const { query, setQuery } = useMap();
  // 목록 서랍을 다시 열어도 마지막 검색어가 보이도록 지금 검색어로 시작한다.
  const [value, setValue] = useState(query);

  return (
    <div role="search" className="relative min-w-0 flex-1">
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

// 정렬 기준 선택 메뉴. 하단 정렬 버튼과 카페 목록 서랍의 제목에 함께 쓴다.
function MapSortMenu({
  trigger,
  icon,
  side = "bottom",
  align = "start",
  onPick,
}: {
  trigger: ComponentProps<typeof DropdownMenuTrigger>["render"];
  icon?: ReactNode;
  side?: "top" | "bottom";
  align?: "start" | "center";
  // 항목을 고를 때마다 실행한다. (이미 선택된 항목을 다시 골라도 실행된다)
  onPick?: () => void;
}) {
  const { sort, setSort } = useMap();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger}>
        {icon}
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
              onClick={onPick}
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
  const {
    instanceRef,
    sort,
    sortedCafes,
    openCafe,
    drawerOpen,
    selectedCafe,
    isDesktop,
  } = useMap();
  // PC에서 오른쪽 상세 서랍이 열리면 확대·축소 버튼을 서랍 왼쪽으로 옮긴다.
  const detailOpen = isDesktop && drawerOpen && selectedCafe !== null;
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
          content: getMarkerContent(cafe, { link: false }),
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
          // 카페 마커에 가려지지 않도록 항상 맨 위에 그린다.
          zIndex: 1000,
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
      {/* 마커 버튼 클릭을 지도 영역에서 한 번에 받는다. (지도 라이브러리가 이벤트를 막기 전에 capture 단계에서 처리) */}
      <div
        ref={mapRef}
        className="size-full"
        onClickCapture={(event) => {
          const target = (event.target as HTMLElement).closest<HTMLElement>(
            "[data-cafe-slug]",
          );
          const slug = target?.dataset.cafeSlug;
          if (slug) openCafe(slug);
        }}
      />
      {zoom !== null && (
        <div
          className={`absolute top-4 z-20 hidden items-center gap-1 rounded-full border-2 border-bark bg-white p-1 text-xs font-bold text-bark shadow-[3px_3px_0_var(--color-bark)] transition-[right] duration-300 lg:flex ${
            detailOpen ? "right-[calc(min(23rem,100vw-2rem)+2rem)]" : "right-4"
          }`}
        >
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

// 화면 왼쪽 위 로고 버튼. 누르면 홈으로 가기와 보기 방식(지도·카드·목록·이미지) 이동 메뉴가 열린다.
export function MapNavMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="sprout"
            size="icon"
            aria-label="홈·페이지 이동 메뉴"
            className="size-11 bg-leaf p-0 text-bark hover:bg-leaf-dark"
          />
        }
      >
        <MapPinned className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="start"
        sideOffset={8}
        className="w-48 rounded-2xl border-2 border-bark bg-white p-1.5 shadow-[3px_3px_0_var(--color-bark)] ring-0"
      >
        <DropdownMenuItem
          render={<Link href="/" />}
          className="rounded-xl py-2 font-bold text-bark focus:bg-cream focus:text-bark"
        >
          <House className="text-autumn" />
          홈으로 바로가기
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[#ead9ca]" />
        {introLinks.map(({ href, description, icon: Icon }) => (
          <DropdownMenuItem
            key={href}
            render={<Link href={href} />}
            className="rounded-xl py-2 text-bark focus:bg-cream focus:text-bark"
          >
            <Icon className="text-autumn" />
            {description}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// 화면 하단 가운데의 정렬 버튼. 누르면 정렬 기준 메뉴가 열리고, 기준을 고르면 카페 목록 서랍이 열린다.
export function MapListButton() {
  const { setListOpen } = useMap();

  return (
    <MapSortMenu
      side="top"
      align="center"
      onPick={() => setListOpen(true)}
      icon={<List aria-hidden="true" className="size-4 text-autumn" />}
      trigger={
        <Button
          variant="seed"
          className="h-10 bg-white text-bark shadow-[3px_3px_0_var(--color-bark)] hover:bg-cream"
        />
      }
    />
  );
}

// 모바일 목록 서랍의 높이: 처음엔 화면의 50%, 위로 끌어올리면 90%까지.
const LIST_SNAP_POINTS = [0.5, 0.9];

// 정렬 기준을 고르는 목록 제목과, 그 기준으로 정렬한 상위 카페 목록.
// PC에서는 왼쪽에서, 모바일에서는 아래에서 나온다. 지도를 계속 쓸 수 있도록 모달 없이 띄운다.
export function MapCafeListDrawer() {
  const {
    instanceRef,
    sort,
    sortedCafes,
    listLimit,
    toggleListLimit,
    listOpen,
    setListOpen,
    openCafe,
    drawerOpen,
    selectedCafe,
    isDesktop,
  } = useMap();
  const [snapPoint, setSnapPoint] = useState<number | string | null>(
    LIST_SNAP_POINTS[0],
  );

  // 목록에서 카페를 누르면 지도를 그 위치로 옮기고 상세 서랍을 연다.
  function focusCafe(cafe: MapListCafe) {
    const naver = window.naver;
    const map = instanceRef.current;
    if (naver && map) {
      map.morph(new naver.maps.LatLng(cafe.latitude, cafe.longitude), 16);
    }
    openCafe(cafe.slug);
  }

  return (
    <Drawer
      key={isDesktop ? "desktop" : "mobile"}
      open={listOpen}
      onOpenChange={(open) => {
        setListOpen(open);
        // 다음에 열 때는 다시 50% 높이에서 시작한다.
        if (!open) setSnapPoint(LIST_SNAP_POINTS[0]);
      }}
      swipeDirection={isDesktop ? "left" : "down"}
      modal={false}
      disablePointerDismissal
      {...(isDesktop
        ? {}
        : {
            snapPoints: LIST_SNAP_POINTS,
            snapPoint,
            onSnapPointChange: setSnapPoint,
          })}
    >
      <DrawerContent
        style={isDesktop ? DESKTOP_DRAWER_STYLE : MOBILE_LIST_DRAWER_STYLE}
        className="text-bark"
      >
        {!isDesktop && <DrawerHandle />}
        {/* 헤더: 홈 버튼 | 제목·안내, 아래에 검색창 */}
        <div className="shrink-0 border-b border-[#ead9ca] px-5 pt-4 pb-4 lg:pt-5">
          <div className="flex items-center gap-3">
            <Button
              render={<Link href="/" />}
              nativeButton={false}
              variant="sprout"
              size="icon"
              aria-label="홈으로 이동"
              className="size-11 shrink-0 bg-leaf p-0 text-bark hover:bg-leaf-dark"
            >
              <MapPinned className="size-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <DrawerTitle className="font-paperlogy text-xl font-semibold text-bark">
                카페조아 지도보기
              </DrawerTitle>
              <DrawerDescription className="text-left text-sm break-keep text-stone-500">
                취향에 맞는 카페를 찾아보세요
              </DrawerDescription>
            </div>
            <DrawerClose
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="목록 닫기"
                  className="size-9 shrink-0 self-start rounded-full text-bark hover:bg-white hover:text-autumn"
                />
              }
            >
              <X className="size-5" />
            </DrawerClose>
          </div>
          <div className="mt-4 flex">
            <MapSearch />
          </div>
        </div>

        {/* 정렬 기준 메뉴 + 목록 개수 */}
        <div className="flex shrink-0 items-center justify-between px-5 pt-4 pb-1">
          <MapSortMenu
            trigger={
              <button className="font-paperlogy flex items-center gap-1 rounded-full text-base font-semibold text-bark outline-none hover:text-autumn focus-visible:ring-2 focus-visible:ring-autumn" />
            }
          />
          <button
            type="button"
            onClick={toggleListLimit}
            aria-label={`목록 개수 바꾸기 (지금 TOP ${listLimit})`}
            className="rounded-full bg-autumn px-2.5 py-0.5 text-xs font-bold text-white transition-colors outline-none hover:bg-autumn-dark focus-visible:ring-2 focus-visible:ring-autumn/40"
          >
            TOP {listLimit}
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="space-y-2 p-3">
            {sortedCafes.length === 0 && (
              <p className="py-10 text-center text-sm text-stone-500">
                검색 결과가 없어요.
              </p>
            )}
            {sortedCafes.map((cafe, index) => (
              <article
                key={cafe.slug}
                className={`rounded-2xl border-2 bg-white transition-colors hover:bg-[#fffaf2] ${
                  drawerOpen && selectedCafe?.slug === cafe.slug
                    ? "border-autumn"
                    : "border-transparent"
                }`}
              >
                <Button
                  onClick={() => focusCafe(cafe)}
                  variant="ghost"
                  className="h-auto w-full justify-start gap-3 rounded-2xl border-0 bg-transparent p-2.5 text-left whitespace-normal hover:bg-transparent focus-visible:bg-[#fffaf2] focus-visible:ring-0 active:not-aria-[haspopup]:translate-y-0"
                >
                  <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-stone-200">
                    {/* Next 이미지 최적화(/_next/image)를 거치지 않고 GitHub 주소에서 바로 불러온다. (서버 트래픽 절약) */}
                    <Image
                      unoptimized
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
                </Button>
              </article>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// PC(lg 이상)인지 확인한다. 서랍이 나오는 방향을 정하는 기준이다. 서버에서는 모바일로 본다.
const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribeDesktop(onChange: () => void) {
  const mql = window.matchMedia(DESKTOP_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function useIsDesktop() {
  return useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
}

// PC 서랍 겉모양. 기본 drawer 스타일(흰 배경·작은 모서리·테두리)을 크림색 둥근 박스로 덮어쓴다. (목록·상세 서랍 공통)
const DESKTOP_DRAWER_STYLE = {
  "--drawer-inset": "1rem",
  "--drawer-content-width": "min(23rem, calc(100vw - 2rem))",
  "--drawer-bleed-background": "transparent",
  height: "calc(100dvh - 2rem)",
  borderRadius: "1.5rem",
  border: "none",
  background: "color-mix(in srgb, var(--color-cream) 95%, transparent)",
  backdropFilter: "blur(12px)",
} as CSSProperties;

const MOBILE_DRAWER_STYLE = {
  "--drawer-bleed-background": "var(--color-cream)",
  "--drawer-content-max-height": "calc(100dvh - 4rem)",
  borderRadius: "1.5rem 1.5rem 0 0",
  border: "none",
  background: "var(--color-cream)",
} as CSSProperties;

// 모바일 서랍 위쪽의 손잡이 막대. 끌어서 높이를 바꾸거나 닫을 수 있다는 표시.
function DrawerHandle() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto mt-2.5 h-1.5 w-12 shrink-0 rounded-full bg-[#e0cbb9]"
    />
  );
}

// 모바일 목록 서랍: 위로 끌어올려 90%까지 늘어난다.
// 50%에서는 아래쪽이 화면 밖에 있으므로, 그만큼 아래 여백을 줘서 목록 끝까지 스크롤되게 한다.
const MOBILE_LIST_DRAWER_STYLE = {
  ...MOBILE_DRAWER_STYLE,
  "--drawer-content-max-height": "90dvh",
  paddingBottom:
    "max(0px, calc(var(--drawer-snap-point-offset, 0px) + var(--drawer-swipe-movement-y, 0px)))",
} as CSSProperties;

// 마커를 누르면 열리는 카페 미리보기 서랍. PC에서는 오른쪽에서, 모바일에서는 아래에서 올라온다.
// PC에서는 지도를 계속 움직이고 다른 마커를 누를 수 있도록 모달 없이 띄운다.
export function MapCafeDrawer() {
  const { selectedCafe, drawerOpen, setDrawerOpen } = useMap();
  const isDesktop = useIsDesktop();

  return (
    <Drawer
      // 방향이 바뀌면(창 크기 변경) 새 설정으로 다시 그린다.
      key={isDesktop ? "desktop" : "mobile"}
      open={drawerOpen && selectedCafe !== null}
      onOpenChange={setDrawerOpen}
      swipeDirection={isDesktop ? "right" : "down"}
      modal={!isDesktop}
      disablePointerDismissal={isDesktop}
    >
      <DrawerContent
        style={isDesktop ? DESKTOP_DRAWER_STYLE : MOBILE_DRAWER_STYLE}
        className="text-bark"
      >
        {!isDesktop && <DrawerHandle />}
        {selectedCafe && (
          // 카페가 바뀌면 선택한 사진 등 내부 상태를 처음으로 되돌린다.
          <MapCafeDrawerBody key={selectedCafe.slug} cafe={selectedCafe} />
        )}
      </DrawerContent>
    </Drawer>
  );
}

function MapCafeDrawerBody({ cafe }: { cafe: MapListCafe }) {
  const photos =
    cafe.photos.length > 0 ? cafe.photos : [{ src: cafe.image, alt: "" }];
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [photoIndex, setPhotoIndex] = useState(0);

  // 슬라이드가 넘어갈 때마다 "현재 / 전체" 표시를 갱신한다.
  useEffect(() => {
    if (!carouselApi) return;
    const update = () => setPhotoIndex(carouselApi.selectedScrollSnap());
    carouselApi.on("select", update);
    return () => {
      carouselApi.off("select", update);
    };
  }, [carouselApi]);

  return (
    <>
      {/* 헤더: 목록 서랍 헤더와 같은 구성 (아이콘 | 이름·종류, 아래에 검색창 자리의 상세 버튼) */}
      <div className="shrink-0 border-b border-[#ead9ca] px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-bark bg-leaf text-bark shadow-[2px_2px_0_var(--color-bark)]"
          >
            <Coffee className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <DrawerTitle className="font-paperlogy truncate text-xl font-semibold text-bark">
              {cafe.name}
            </DrawerTitle>
            <p className="truncate text-sm text-stone-500">
              {cafe.types.slice(0, 3).join(" · ")}
            </p>
          </div>
          <DrawerClose
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="닫기"
                className="size-9 shrink-0 self-start rounded-full text-bark hover:bg-white hover:text-autumn"
              />
            }
          >
            <X className="size-5" />
          </DrawerClose>
        </div>

        <Button
          render={<Link href={`/cafe/${cafe.slug}`} />}
          nativeButton={false}
          className="mt-4 h-auto w-full gap-1.5 rounded-full border-2 border-bark bg-white py-2.5 text-sm font-bold text-bark shadow-[3px_3px_0_var(--color-bark)] transition-[box-shadow,color] hover:bg-white hover:text-autumn hover:shadow-[0_0_0_var(--color-bark)]"
        >
          자세히 보기
          <ArrowRight aria-hidden="true" className="size-4" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        {/* 사진 슬라이드. 사진이 모두 3:4 세로 사진이라 원본 비율 그대로 보여준다.
            슬라이드를 끌 때 서랍이 같이 닫히지 않도록 서랍 스와이프에서 제외한다. */}
        <Carousel
          setApi={setCarouselApi}
          opts={{ loop: photos.length > 1 }}
          aria-label={`${cafe.name} 사진`}
          data-base-ui-swipe-ignore=""
          className="group/photos overflow-hidden rounded-2xl bg-stone-200"
        >
          <CarouselContent className="ml-0">
            {photos.map((item, index) => (
              <CarouselItem key={item.src} className="pl-0">
                <div className="relative aspect-3/4">
                  {/* Next 이미지 최적화(/_next/image)를 거치지 않고 GitHub 주소에서 바로 불러온다. (서버 트래픽 절약) */}
                  <Image
                    unoptimized
                    src={item.src}
                    alt={
                      item.alt
                        ? `${cafe.name} ${item.alt}`
                        : `${cafe.name} 대표 사진`
                    }
                    fill
                    sizes="(min-width: 1024px) 336px, 100vw"
                    priority={index === 0}
                    className="object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {photos.length > 1 && (
            <>
              <CarouselPrevious
                variant="ghost"
                aria-label="이전 사진"
                className="left-2.5 size-8 bg-white/85 text-bark opacity-0 transition-opacity group-hover/photos:opacity-100 hover:bg-white hover:text-autumn focus-visible:opacity-100"
              />
              <CarouselNext
                variant="ghost"
                aria-label="다음 사진"
                className="right-2.5 size-8 bg-white/85 text-bark opacity-0 transition-opacity group-hover/photos:opacity-100 hover:bg-white hover:text-autumn focus-visible:opacity-100"
              />
              <span className="pointer-events-none absolute right-2.5 bottom-2.5 rounded-full bg-bark/75 px-2 py-0.5 text-[11px] font-bold text-white">
                {photoIndex + 1} / {photos.length}
              </span>
            </>
          )}
        </Carousel>

        {/* 평점/리뷰 수 배지: ★ 네이버 4.58/4555, ★ 구글 4.40/2455 */}
        {(cafe.naverRating !== null || cafe.googleRating !== null) && (
          <div className="mt-4 grid grid-cols-2 gap-1.5 text-xs font-bold">
            {cafe.naverRating !== null && (
              <span className="flex items-center justify-center gap-1 rounded-full bg-autumn px-2.5 py-1.5 text-white">
                <Star aria-hidden="true" className="size-3 fill-white" />
                네이버 {cafe.naverRating.toFixed(2)}/{cafe.naverReviewCount}
              </span>
            )}
            {cafe.googleRating !== null && (
              <span className="flex items-center justify-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-[#795f55]">
                <Star
                  aria-hidden="true"
                  className="size-3 fill-autumn text-autumn"
                />
                구글 {cafe.googleRating.toFixed(2)}/{cafe.googleReviewCount}
              </span>
            )}
          </div>
        )}

        {/* 소개 */}
        <div className="mt-4 rounded-2xl bg-white p-4">
          <DrawerDescription className="text-left text-sm leading-6 text-[#795f55]">
            {cafe.description}
          </DrawerDescription>
        </div>
      </div>
    </>
  );
}
