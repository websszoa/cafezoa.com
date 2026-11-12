"use client";

import Script from "next/script";
import { useRef } from "react";

declare global {
  interface Window {
    naver?: {
      maps: {
        Map: new (
          element: HTMLElement,
          options: { center: unknown; zoom: number },
        ) => unknown;
        LatLng: new (lat: number, lng: number) => unknown;
      };
    };
  }
}

export function PageMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  function initMap() {
    const naver = window.naver;
    if (!naver || !mapRef.current) return;

    new naver.maps.Map(mapRef.current, {
      center: new naver.maps.LatLng(37.5665, 126.978),
      zoom: 12,
    });
  }

  return (
    <main className="h-dvh w-full">
      <Script
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`}
        onReady={initMap}
      />
      <div ref={mapRef} className="size-full" />
    </main>
  );
}
