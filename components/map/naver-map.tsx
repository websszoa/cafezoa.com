"use client";

import Script from "next/script";
import { useRef } from "react";

export default function NaverMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  function initMap() {
    if (!mapRef.current) return;

    new window.naver.maps.Map(mapRef.current, {
      center: new window.naver.maps.LatLng(37.5665, 126.978),
      zoom: 13,
    });
  }

  return (
    <>
      <Script
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`}
        strategy="afterInteractive"
        onLoad={initMap}
      />
      <div ref={mapRef} className="w-full h-full" />
    </>
  );
}
