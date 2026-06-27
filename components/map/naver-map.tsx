"use client";

import Script from "next/script";
import { useRef, useState } from "react";
import { LocateFixed, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NaverMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markerRef = useRef<unknown>(null);
  const [locating, setLocating] = useState(false);

  function initMap() {
    if (!mapRef.current) return;

    mapInstanceRef.current = new window.naver.maps.Map(mapRef.current, {
      center: new window.naver.maps.LatLng(37.5665, 126.978),
      zoom: 13,
    });
  }

  function handleLocate() {
    if (!navigator.geolocation || !mapInstanceRef.current) return;

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const latlng = new window.naver.maps.LatLng(latitude, longitude);
        const map = mapInstanceRef.current as {
          setCenter: (latlng: unknown) => void;
          setZoom: (zoom: number) => void;
        };

        map.setCenter(latlng);
        map.setZoom(15);

        if (markerRef.current) {
          (
            markerRef.current as { setPosition: (latlng: unknown) => void }
          ).setPosition(latlng);
        } else {
          markerRef.current = new window.naver.maps.Marker({
            position: latlng,
            map: mapInstanceRef.current,
            icon: {
              content: `<div style="width:16px;height:16px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
              anchor: new window.naver.maps.Point(8, 8),
            },
          });
        }

        setLocating(false);
      },
      () => {
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className="relative w-full h-full">
      <Script
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`}
        strategy="afterInteractive"
        onLoad={initMap}
      />
      <div ref={mapRef} className="w-full h-full" />

      {/* 내 위치 버튼 */}
      <Button
        onClick={handleLocate}
        disabled={locating}
        size="icon"
        variant="outline"
        className={cn(
          "absolute bottom-6 right-6 size-11 rounded-full bg-background z-10",
          locating && "opacity-70",
        )}
        aria-label="내 위치 찾기"
      >
        {locating ? (
          <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        ) : (
          <LocateFixed className="size-5 text-primary" />
        )}
      </Button>
    </div>
  );
}
