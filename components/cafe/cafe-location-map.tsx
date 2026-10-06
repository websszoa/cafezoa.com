"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

type MapInstance = object;

interface MarkerInstance {
  setMap(map: MapInstance | null): void;
}

interface NaverMapsApi {
  maps: {
    LatLng: new (latitude: number, longitude: number) => unknown;
    Point: new (x: number, y: number) => unknown;
    Map: new (
      element: HTMLElement,
      options: { center: unknown; zoom: number },
    ) => MapInstance;
    Marker: new (options: {
      map: MapInstance;
      position: unknown;
      title: string;
      icon: { anchor: unknown; content: string };
    }) => MarkerInstance;
  };
}

const naverMapClientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

function escapeMarkerText(value: string) {
  return value.replace(
    /[&<>"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[
        character
      ]!,
  );
}

function markerIcon(name: string) {
  return `
    <div style="position:relative;display:flex;justify-content:center;width:160px;height:43px;">
      <div style="max-width:150px;height:34px;overflow:hidden;border:2px solid #3a241c;border-radius:999px;background:#9cff75;padding:0 13px;color:#3a241c;font-size:12px;font-weight:800;line-height:30px;text-align:center;text-overflow:ellipsis;white-space:nowrap;">
        ${escapeMarkerText(name)}
      </div>
      <span style="position:absolute;bottom:4px;left:50%;width:11px;height:11px;border-right:2px solid #3a241c;border-bottom:2px solid #3a241c;background:#9cff75;transform:translateX(-50%) rotate(45deg);"></span>
    </div>
  `;
}

export function CafeLocationMap({
  name,
  latitude,
  longitude,
}: {
  name: string;
  latitude: number;
  longitude: number;
}) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapInstance | null>(null);
  const markerRef = useRef<MarkerInstance | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const initializeMap = useCallback(() => {
    const naver = (window as Window & { naver?: NaverMapsApi }).naver;
    if (!mapElementRef.current || !naver || mapRef.current) return;

    const position = new naver.maps.LatLng(latitude, longitude);
    const map = new naver.maps.Map(mapElementRef.current, {
      center: position,
      zoom: 17,
    });

    mapRef.current = map;
    markerRef.current = new naver.maps.Marker({
      map,
      position,
      title: name,
      icon: {
        content: markerIcon(name),
        anchor: new naver.maps.Point(80, 42),
      },
    });
    setErrorMessage(null);
  }, [latitude, longitude, name]);

  useEffect(() => {
    initializeMap();
    const retryId = window.setInterval(initializeMap, 100);
    const timeoutId = window.setTimeout(() => {
      window.clearInterval(retryId);
      if (!mapRef.current) setErrorMessage("지도를 불러오지 못했습니다.");
    }, 10000);

    return () => {
      window.clearInterval(retryId);
      window.clearTimeout(timeoutId);
      markerRef.current?.setMap(null);
      markerRef.current = null;
      mapRef.current = null;
    };
  }, [initializeMap]);

  if (!naverMapClientId) {
    return <MapFallback message="네이버 지도 클라이언트 ID가 없습니다." />;
  }

  return (
    <div className="relative h-[22rem] bg-[#e9edf2] sm:h-[28rem]">
      <Script
        id="naver-maps-sdk"
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(naverMapClientId)}`}
        strategy="afterInteractive"
        onReady={initializeMap}
        onError={() => setErrorMessage("네이버 지도를 불러오지 못했습니다.")}
      />
      <div ref={mapElementRef} className="size-full" aria-label={`${name} 위치 지도`} />
      {errorMessage && (
        <div className="absolute inset-0">
          <MapFallback message={errorMessage} />
        </div>
      )}
    </div>
  );
}

function MapFallback({ message }: { message: string }) {
  return (
    <div className="grid size-full min-h-64 place-items-center bg-[#e9edf2] px-5 text-center text-sm font-bold text-[#795f55]">
      {message}
    </div>
  );
}
