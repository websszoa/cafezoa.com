"use client";

import { FallbackImage } from "@/components/ui/fallback-image";
import Link from "next/link";
import Script from "next/script";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Coffee,
  Home,
  LocateFixed,
  MapPinned,
  Minus,
  Plus,
  Search,
  Star,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cafes, cn, type Cafe, type RatingEntry } from "@/lib/utils";

interface NaverMapInstance {
  getZoom(): number;
  morph(coordinate: unknown, zoom: number): void;
  setZoom(zoom: number): void;
}

interface NaverMapMarker {
  setMap(map: NaverMapInstance | null): void;
}

interface NaverMapEventListener {
  eventName?: string;
}

interface NaverMapApi {
  maps: {
    LatLng: new (latitude: number, longitude: number) => unknown;
    Point: new (x: number, y: number) => unknown;
    Map: new (
      element: HTMLElement,
      options: {
        center: unknown;
        zoom: number;
      },
    ) => NaverMapInstance;
    Marker: new (options: {
      map: NaverMapInstance;
      position: unknown;
      title: string;
      icon: {
        anchor: unknown;
        content: string;
      };
    }) => NaverMapMarker;
    Event: {
      addListener(
        target: object,
        eventName: string,
        listener: () => void,
      ): NaverMapEventListener;
      removeListener(listener: NaverMapEventListener): void;
    };
  };
}

declare global {
  interface Window {
    naver?: NaverMapApi;
    navermap_authFailure?: () => void;
  }
}

const naverMapClientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
const faceIcons = Array.from(
  { length: 10 },
  (_, index) => `/face/face${String(index + 1).padStart(2, "0")}.webp`,
);

interface CurrentLocation {
  latitude: number;
  longitude: number;
}

type MobileSheetState = "collapsed" | "half" | "full";

function distanceBetween(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
) {
  const toRadians = (degree: number) => (degree * Math.PI) / 180;
  const latitudeDifference = toRadians(latitudeB - latitudeA);
  const longitudeDifference = toRadians(longitudeB - longitudeA);
  const originLatitude = toRadians(latitudeA);
  const targetLatitude = toRadians(latitudeB);
  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(targetLatitude) *
      Math.sin(longitudeDifference / 2) ** 2;

  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function formatDistance(distance: number) {
  return distance < 1
    ? `${Math.round(distance * 1000)}m`
    : `${distance.toFixed(1)}km`;
}

function escapeMarkerText(value: string) {
  return value.replace(
    /[&<>"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]!,
  );
}

function displayRatingOf(cafe: Cafe): RatingEntry | undefined {
  return (
    [cafe.naver, cafe.google].find((rating) => rating && rating[2] > 0) ??
    cafe.naver ??
    cafe.google
  );
}

function cafeMarkerIcon(name: string, slug: string, rating?: RatingEntry) {
  const ratingBadge =
    rating === undefined
      ? ""
      : rating[2] === 0
        ? "신규"
        : `★ ${rating[1].toFixed(2)}`;

  return `
    <div style="position:relative;display:flex;justify-content:center;width:260px;height:52px;">
      <a href="/cafe/${encodeURIComponent(slug)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeMarkerText(name)} 상세페이지를 새 탭에서 열기" style="position:absolute;top:18px;left:50%;height:34px;min-width:max-content;border:2px solid #3a241c;border-radius:999px;background:#9cff75;padding:0 14px;color:#3a241c;font-size:12px;font-weight:800;line-height:30px;text-align:center;text-decoration:none;white-space:nowrap;transform:translateX(-50%);">
        ${escapeMarkerText(name)}
      </a>
      ${
        ratingBadge === ""
          ? ""
          : `<span style="position:absolute;top:0;left:50%;z-index:1;border:2px solid #3a241c;border-radius:999px;background:#ff5b20;padding:2px 8px;color:white;font-size:10px;font-weight:800;line-height:16px;white-space:nowrap;transform:translateX(-50%);">${ratingBadge}</span>`
      }
    </div>
  `;
}

function currentLocationMarkerIcon(faceIcon: string) {
  return `
    <div class="current-location-marker" role="img" aria-label="내 현재 위치">
      <span class="current-location-marker__pulse"></span>
      <span class="current-location-marker__face">
        <img src="${faceIcon}" alt="" draggable="false" />
      </span>
    </div>
  `;
}

export function MapPage() {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<NaverMapInstance | null>(null);
  const markerRefs = useRef<NaverMapMarker[]>([]);
  const currentLocationMarkerRef = useRef<NaverMapMarker | null>(null);
  const currentFaceIconRef = useRef<string | null>(null);
  const zoomListenerRef = useRef<NaverMapEventListener | null>(null);
  const sheetDragStartYRef = useRef<number | null>(null);
  const sheetWasDraggedRef = useRef(false);
  const [draftQuery, setDraftQuery] = useState("");
  const [query, setQuery] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(9);
  const [currentLocation, setCurrentLocation] =
    useState<CurrentLocation | null>(null);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mobileSheetState, setMobileSheetState] =
    useState<MobileSheetState>("collapsed");

  const moveMobileSheet = (direction: "up" | "down") => {
    setMobileSheetState((current) => {
      const states: MobileSheetState[] = ["collapsed", "half", "full"];
      const currentIndex = states.indexOf(current);
      const nextIndex =
        direction === "up"
          ? Math.min(currentIndex + 1, states.length - 1)
          : Math.max(currentIndex - 1, 0);
      return states[nextIndex];
    });
  };

  const filteredCafes = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return cafes;

    return cafes.filter((cafe) =>
      [cafe.name, cafe.location.address, ...cafe.type].some((value) =>
        value.toLowerCase().includes(keyword),
      ),
    );
  }, [query]);

  const initializeMap = useCallback(() => {
    if (!mapElementRef.current || !window.naver || mapInstanceRef.current) {
      return;
    }

    const map = new window.naver.maps.Map(mapElementRef.current, {
      center: new window.naver.maps.LatLng(36.35, 127.8),
      zoom: 9,
    });
    mapInstanceRef.current = map;

    markerRefs.current = cafes.map((cafe) => {
      const marker = new window.naver!.maps.Marker({
        map,
        position: new window.naver!.maps.LatLng(
          cafe.location.latitude,
          cafe.location.longitude,
        ),
        title: cafe.name,
        icon: {
          content: cafeMarkerIcon(
            cafe.name,
            cafe.slug,
            displayRatingOf(cafe),
          ),
          anchor: new window.naver!.maps.Point(130, 52),
        },
      });

      return marker;
    });

    setZoomLevel(map.getZoom());
    zoomListenerRef.current = window.naver.maps.Event.addListener(
      map,
      "zoom_changed",
      () => setZoomLevel(map.getZoom()),
    );
    setIsMapReady(true);
    setErrorMessage(null);
  }, []);

  const moveToCafe = (latitude: number, longitude: number) => {
    if (!window.naver || !mapInstanceRef.current) return;

    mapInstanceRef.current.morph(
      new window.naver.maps.LatLng(latitude, longitude),
      18,
    );
  };

  const changeZoom = (amount: number) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.setZoom(map.getZoom() + amount);
  };

  const moveToCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("현재 위치를 사용할 수 없는 브라우저입니다.");
      return;
    }

    setIsLocating(true);
    setLocationMessage(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCurrentLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        moveToCafe(coords.latitude, coords.longitude);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        setLocationMessage("위치 권한을 허용해 주세요.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCurrentLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      },
      () => undefined,
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }, []);

  useEffect(() => {
    if (!isMapReady || !currentLocation || !window.naver) return;

    currentFaceIconRef.current ??=
      faceIcons[Math.floor(Math.random() * faceIcons.length)];
    currentLocationMarkerRef.current?.setMap(null);
    currentLocationMarkerRef.current = new window.naver.maps.Marker({
      map: mapInstanceRef.current!,
      position: new window.naver.maps.LatLng(
        currentLocation.latitude,
        currentLocation.longitude,
      ),
      title: "내 현재 위치",
      icon: {
        content: currentLocationMarkerIcon(currentFaceIconRef.current),
        anchor: new window.naver.maps.Point(26, 26),
      },
    });

    return () => {
      currentLocationMarkerRef.current?.setMap(null);
      currentLocationMarkerRef.current = null;
    };
  }, [currentLocation, isMapReady]);

  useEffect(() => {
    window.navermap_authFailure = () => {
      setErrorMessage("네이버 지도 인증에 실패했습니다.");
    };

    return () => {
      delete window.navermap_authFailure;
    };
  }, []);

  useEffect(() => {
    initializeMap();

    if (mapInstanceRef.current) return;

    const retryId = window.setInterval(initializeMap, 100);
    const timeoutId = window.setTimeout(() => {
      window.clearInterval(retryId);

      if (!mapInstanceRef.current) {
        setErrorMessage(
          "네이버 지도 초기화가 지연되고 있습니다. 새로고침해 주세요.",
        );
      }
    }, 10000);

    return () => {
      window.clearInterval(retryId);
      window.clearTimeout(timeoutId);
      if (window.naver && zoomListenerRef.current) {
        window.naver.maps.Event.removeListener(zoomListenerRef.current);
      }
      markerRefs.current.forEach((marker) => marker.setMap(null));
      markerRefs.current = [];
      currentLocationMarkerRef.current?.setMap(null);
      currentLocationMarkerRef.current = null;
      mapInstanceRef.current = null;
    };
  }, [initializeMap]);

  if (!naverMapClientId) {
    return <MapError message="네이버 지도 클라이언트 ID가 없습니다." />;
  }

  return (
    <main className="fixed inset-0 bg-[#e9edf2]">
      <Script
        id="naver-maps-sdk"
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(naverMapClientId)}`}
        strategy="afterInteractive"
        onReady={initializeMap}
        onError={() => setErrorMessage("네이버 지도를 불러오지 못했습니다.")}
      />
      <div ref={mapElementRef} className="size-full" aria-label="네이버 지도" />
      {!isMapReady && !errorMessage && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-sm font-bold text-[#795f55]">
          지도를 불러오는 중...
        </div>
      )}
      {isMapReady && (
        <div
          className="absolute top-5 right-5 z-10 flex items-center overflow-hidden rounded-full border border-white/80 bg-white/95 sm:top-6 sm:right-5"
          aria-label={`지도 레벨 ${zoomLevel}`}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => changeZoom(-1)}
            aria-label="지도 축소"
            className="rounded-none text-[#3a241c] hover:bg-[#fff3e5]"
          >
            <Minus className="size-3.5" />
          </Button>
          <span className="min-w-7 border-x border-[#ead9ca] px-1 text-center text-xs font-extrabold text-[#3a241c]">
            {zoomLevel}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => changeZoom(1)}
            aria-label="지도 확대"
            className="rounded-none text-[#3a241c] hover:bg-[#fff3e5]"
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
      )}
      <aside
        className={cn(
          "absolute right-2 bottom-2 left-2 z-20 flex flex-col overflow-hidden rounded-3xl border border-white/70 bg-[#fff3e5]/95 shadow-[0_20px_55px_rgba(58,36,28,0.25)] backdrop-blur-md transition-[height] duration-300 ease-out lg:inset-y-4 lg:right-auto lg:left-4 lg:h-auto lg:w-[min(23rem,calc(100vw-2rem))]",
          mobileSheetState === "collapsed" && "h-26",
          mobileSheetState === "half" && "h-[52dvh]",
          mobileSheetState === "full" && "h-[calc(100dvh-1rem)]",
        )}
        aria-label="카페 목록"
      >
        <button
          type="button"
          className="flex h-7 shrink-0 touch-none items-center justify-center lg:hidden"
          aria-label={
            mobileSheetState === "collapsed"
              ? "카페 목록 펼치기"
              : "카페 목록 크기 변경"
          }
          aria-expanded={mobileSheetState !== "collapsed"}
          onClick={() => {
            if (sheetWasDraggedRef.current) {
              sheetWasDraggedRef.current = false;
              return;
            }
            if (mobileSheetState === "full") {
              setMobileSheetState("collapsed");
            } else {
              moveMobileSheet("up");
            }
          }}
          onPointerDown={(event) => {
            sheetDragStartYRef.current = event.clientY;
            sheetWasDraggedRef.current = false;
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerUp={(event) => {
            const startY = sheetDragStartYRef.current;
            sheetDragStartYRef.current = null;
            if (startY === null) return;

            const distance = event.clientY - startY;
            if (Math.abs(distance) < 40) return;
            sheetWasDraggedRef.current = true;
            moveMobileSheet(distance < 0 ? "up" : "down");
          }}
          onPointerCancel={() => {
            sheetDragStartYRef.current = null;
          }}
        >
          <span className="h-1.5 w-12 rounded-full bg-[#c9afa0]" />
        </button>

        <div className="border-b border-[#ead9ca] px-4 pb-3 lg:px-5 lg:pt-5 lg:pb-4">
          <div className="flex items-center">
            <div className="flex items-center gap-3">
              <span className="hidden size-11 place-items-center rounded-full bg-[#9cff75] text-[#3a241c] lg:grid">
                <MapPinned className="size-5" />
              </span>
              <div>
                <h1 className="font-paperlogy text-lg font-semibold text-[#3a241c] lg:text-xl">
                  카페 지도
                </h1>
                <p className="hidden text-sm text-stone-500 lg:block">
                  지도에서 취향에 맞는 카페를 찾아보세요.
                </p>
              </div>
            </div>
            <p className="ml-auto text-xs font-bold text-[#795f55] lg:hidden">
              카페 {filteredCafes.length}곳
            </p>
          </div>

          <form
            className={cn(
              "relative mt-3 lg:mt-4 lg:block",
              mobileSheetState === "collapsed" && "hidden",
            )}
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              setQuery(draftQuery);
            }}
          >
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-stone-500" />
            <input
              value={draftQuery}
              onChange={(event) => setDraftQuery(event.target.value)}
              placeholder="카페 이름, 지역으로 검색"
              className="w-full rounded-full border-2 border-[#3a241c] bg-white py-3 pr-10 pl-10 text-sm text-[#3a241c] shadow-[3px_3px_0_#3a241c] outline-none transition-shadow placeholder:text-stone-400 focus:shadow-[1px_1px_0_#3a241c]"
            />
            {draftQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => {
                  setDraftQuery("");
                  setQuery("");
                }}
                aria-label="검색어 지우기"
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full text-stone-500 hover:bg-[#fff3e5] hover:text-[#3a241c]"
              >
                <X className="size-4" />
              </Button>
            )}
          </form>

          <p className="mt-4 hidden text-xs font-bold text-[#795f55] lg:block">
            카페 {filteredCafes.length}곳
          </p>
        </div>

        <div
          className={cn(
            "min-h-0 flex-1 space-y-2 overflow-y-auto p-3 lg:block",
            mobileSheetState === "collapsed" && "hidden",
          )}
        >
          {filteredCafes.length ? (
            filteredCafes.map((cafe) => {
              const displayRating = displayRatingOf(cafe);
              const distance = currentLocation
                ? distanceBetween(
                    currentLocation.latitude,
                    currentLocation.longitude,
                    cafe.location.latitude,
                    cafe.location.longitude,
                  )
                : null;

              return (
                <div
                  key={cafe.slug}
                  className="group relative rounded-2xl bg-white transition hover:bg-[#fffaf2] hover:shadow-[0_8px_18px_rgba(145,75,0,0.12)]"
                >
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  moveToCafe(cafe.location.latitude, cafe.location.longitude);
                  setMobileSheetState("collapsed");
                }}
                className="h-auto w-full justify-start gap-3 rounded-2xl bg-transparent p-3 pr-11 text-left whitespace-normal hover:bg-transparent"
              >
                <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-stone-200">
                  <FallbackImage
                    src={cafe.thumbnail}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="font-paperlogy min-w-0 truncate text-base font-semibold text-[#3a241c]">
                      {cafe.name}
                    </span>
                    {distance !== null && (
                      <span className="shrink-0 rounded-full bg-[#fff3e5] px-2 py-0.5 text-[10px] font-extrabold text-[#ff5b20]">
                        {formatDistance(distance)}
                      </span>
                    )}
                  </span>
                  <span className="mt-1 flex items-center gap-1 truncate text-xs text-stone-600">
                    <Coffee className="size-3.5 shrink-0 text-[#ff5b20]" />
                    {cafe.type.join(" · ")}
                  </span>
                  {displayRating && (
                    <span className="mt-1.5 flex items-center gap-1 text-xs font-bold text-[#795f55]">
                      {displayRating[2] === 0 ? (
                        <span className="rounded-full bg-[#ff5b20] px-2 py-0.5 text-[10px] font-extrabold text-white">
                          신규
                        </span>
                      ) : (
                        <>
                          <Star className="size-3.5 fill-[#ff5b20] text-[#ff5b20]" />
                          {displayRating[1].toFixed(2)}
                        </>
                      )}
                    </span>
                  )}
                </span>
              </Button>
                <Button
                  render={<Link href={`/cafe/${cafe.slug}`} />}
                  nativeButton={false}
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${cafe.name} 상세 정보 보기`}
                  className="absolute top-3 right-2 rounded-full text-[#ff5b20] hover:bg-[#fff3e5]"
                >
                  <ArrowRight className="size-4" />
                </Button>
                </div>
              );
            })
          ) : (
            <p className="px-4 py-12 text-center text-sm text-stone-500">
              검색 결과가 없어요.
            </p>
          )}
        </div>
      </aside>
      <div
        className={cn(
          "absolute right-4 z-10 flex flex-col items-end gap-2 sm:right-5 lg:top-auto lg:bottom-8",
          mobileSheetState === "collapsed"
            ? "bottom-30"
            : "top-18 bottom-auto",
        )}
      >
        {locationMessage && (
          <p className="rounded-full bg-white px-4 py-2 text-xs font-bold text-[#3a241c] shadow-lg">
            {locationMessage}
          </p>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={moveToCurrentLocation}
          disabled={isLocating}
          aria-label="내 위치 찾기"
          className="size-11 rounded-full bg-white text-[#ff5b20] hover:-translate-y-0.5 hover:bg-white sm:size-12"
        >
          <LocateFixed
            className={cn("size-5", isLocating && "animate-pulse")}
          />
        </Button>
        <Button
          render={<Link href="/" />}
          nativeButton={false}
          variant="ghost"
          size="icon"
          aria-label="홈으로"
          className="size-11 rounded-full bg-[#9cff75] text-[#3a241c] hover:-translate-y-0.5 hover:bg-[#8df267] sm:size-12"
        >
          <Home className="size-5" />
        </Button>
      </div>
      {errorMessage && <MapError message={errorMessage} />}
    </main>
  );
}

function MapError({ message }: { message: string }) {
  return (
    <main className="fixed inset-0 grid place-items-center bg-[#fff3e5] px-5 text-center text-sm text-[#3a241c]">
      <p className="rounded-2xl bg-white px-6 py-4 shadow-lg">{message}</p>
    </main>
  );
}
