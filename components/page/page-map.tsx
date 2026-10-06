"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
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
import { cafes, cn } from "@/lib/utils";

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

function escapeMarkerText(value: string) {
  return value.replace(
    /[&<>"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]!,
  );
}

function cafeMarkerIcon(name: string) {
  return `
    <div style="position:relative;display:flex;justify-content:center;width:160px;height:43px;">
      <div style="max-width:150px;height:34px;overflow:hidden;border:2px solid #3a241c;border-radius:999px;background:#9cff75;padding:0 13px;color:#3a241c;font-size:12px;font-weight:800;line-height:30px;text-align:center;text-overflow:ellipsis;white-space:nowrap;">
        ${escapeMarkerText(name)}
      </div>
      <span style="position:absolute;bottom:4px;left:50%;width:11px;height:11px;border-right:2px solid #3a241c;border-bottom:2px solid #3a241c;background:#9cff75;transform:translateX(-50%) rotate(45deg);"></span>
    </div>
  `;
}

export function MapPage() {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<NaverMapInstance | null>(null);
  const markerRefs = useRef<NaverMapMarker[]>([]);
  const zoomListenerRef = useRef<NaverMapEventListener | null>(null);
  const [query, setQuery] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(9);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
          content: cafeMarkerIcon(cafe.name),
          anchor: new window.naver!.maps.Point(80, 42),
        },
      });

      window.naver!.maps.Event.addListener(marker, "click", () => {
        map.morph(
          new window.naver!.maps.LatLng(
            cafe.location.latitude,
            cafe.location.longitude,
          ),
          16,
        );
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
          className="absolute top-5 right-5 z-10 flex items-center overflow-hidden rounded-full border border-white/80 bg-white/95 shadow-md backdrop-blur-sm sm:top-8 sm:right-8"
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
      <aside className="absolute inset-y-4 left-4 z-10 flex w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-white/70 bg-[#fff3e5]/95 shadow-[0_20px_55px_rgba(58,36,28,0.25)] backdrop-blur-md">
        <div className="border-b border-[#ead9ca] px-5 pt-5 pb-4">
          <div className="flex items-center">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-[#9cff75] text-[#3a241c]">
                <MapPinned className="size-5" />
              </span>
              <div>
                <p className="font-paperlogy text-xl font-semibold text-[#3a241c]">
                  카페 지도
                </p>
                <p className="text-sm text-stone-500">
                  지도에서 취향에 맞는 카페를 찾아보세요.
                </p>
              </div>
            </div>
          </div>

          <div className="relative mt-4">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-stone-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="카페 이름, 지역으로 검색"
              className="w-full rounded-full border-2 border-[#3a241c] bg-white py-3 pr-10 pl-10 text-sm text-[#3a241c] shadow-[3px_3px_0_#3a241c] outline-none transition-shadow placeholder:text-stone-400 focus:shadow-[1px_1px_0_#3a241c]"
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setQuery("")}
                aria-label="검색어 지우기"
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full text-stone-500 hover:bg-[#fff3e5] hover:text-[#3a241c]"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>

          <p className="mt-4 text-xs font-bold text-[#795f55]">
            카페 {filteredCafes.length}곳
          </p>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {filteredCafes.length ? (
            filteredCafes.map((cafe) => (
              <Button
                key={cafe.slug}
                type="button"
                variant="ghost"
                onClick={() =>
                  moveToCafe(cafe.location.latitude, cafe.location.longitude)
                }
                className="h-auto w-full justify-start gap-3 rounded-2xl bg-white p-3 text-left whitespace-normal hover:bg-[#fffaf2] hover:shadow-[0_8px_18px_rgba(145,75,0,0.12)]"
              >
                <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-stone-200">
                  <Image
                    src={cafe.thumbnail}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-paperlogy block truncate text-base font-semibold text-[#3a241c]">
                    {cafe.name}
                  </span>
                  <span className="mt-1 flex items-center gap-1 truncate text-xs text-stone-600">
                    <Coffee className="size-3.5 shrink-0 text-[#ff5b20]" />
                    {cafe.type.join(" · ")}
                  </span>
                  {cafe.naver && (
                    <span className="mt-1.5 flex items-center gap-1 text-xs font-bold text-[#795f55]">
                      <Star className="size-3.5 fill-[#ff5b20] text-[#ff5b20]" />
                      {cafe.naver[1].toFixed(2)}
                    </span>
                  )}
                </span>
              </Button>
            ))
          ) : (
            <p className="px-4 py-12 text-center text-sm text-stone-500">
              검색 결과가 없어요.
            </p>
          )}
        </div>
      </aside>
      <div className="absolute right-5 bottom-6 z-10 flex flex-col items-end gap-3 sm:right-8 sm:bottom-8">
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
          className="size-11 rounded-full bg-white text-[#ff5b20] shadow-[0_8px_18px_rgba(58,36,28,0.22)] hover:-translate-y-0.5 hover:bg-white sm:size-12"
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
          className="size-11 rounded-full bg-[#9cff75] text-[#3a241c] shadow-[0_8px_18px_rgba(58,36,28,0.22)] hover:-translate-y-0.5 hover:bg-[#8df267] sm:size-12"
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
