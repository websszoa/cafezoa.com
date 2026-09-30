"use client";

import Script from "next/script";
import { LocateFixed, Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { Cafe } from "@/lib/cafes";

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[
        character
      ] ?? character,
  );
}

function createCafeMarkerIcon(name: string) {
  return {
    content: `<div style="position:relative;display:inline-flex;width:max-content;max-width:none;align-items:center;justify-content:center;overflow:visible;transform:translateX(-50%);padding:9px 13px;border-radius:12px;background:#4a2c20;color:#fff;font-size:13px;font-weight:700;line-height:1.2;white-space:nowrap;word-break:keep-all;box-sizing:border-box;box-shadow:0 4px 12px rgba(38,26,20,.2);">${escapeHtml(name)}<span style="position:absolute;left:50%;bottom:-7px;width:0;height:0;transform:translateX(-50%);border-left:7px solid transparent;border-right:7px solid transparent;border-top:8px solid #4a2c20;"></span></div>`,
    anchor: new window.naver.maps.Point(0, 44),
  };
}

export default function NaverMap({
  selectedCafe,
}: {
  selectedCafe: Cafe | null;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<NaverMapInstance | null>(null);
  const markerRef = useRef<NaverMarkerInstance | null>(null);
  const [zoomLevel, setZoomLevel] = useState(12);
  const [locating, setLocating] = useState(false);

  function showCafeOnMap(cafe: Cafe, map: NaverMapInstance) {
    const position = new window.naver.maps.LatLng(
      cafe.latitude,
      cafe.longitude,
    );

    map.panTo(position);
    map.setZoom(16);

    const icon = createCafeMarkerIcon(cafe.name);

    if (markerRef.current) {
      markerRef.current.setPosition(position);
      markerRef.current.setIcon(icon);
    } else {
      markerRef.current = new window.naver.maps.Marker({
        position,
        map,
        icon,
      });
    }
  }

  useEffect(() => {
    if (!selectedCafe || !mapInstanceRef.current) return;
    showCafeOnMap(selectedCafe, mapInstanceRef.current);
  }, [selectedCafe]);

  function initMap() {
    if (!mapRef.current) return;

    const map = new window.naver.maps.Map(mapRef.current, {
      center: new window.naver.maps.LatLng(37.5665, 126.978),
      zoom: 12,
    });

    mapInstanceRef.current = map;
    setZoomLevel(map.getZoom());
    window.naver.maps.Event.addListener(map, "zoom_changed", () => {
      setZoomLevel(map.getZoom());
    });

    if (selectedCafe) {
      showCafeOnMap(selectedCafe, map);
    }
  }

  function changeZoom(amount: number) {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.setZoom(Math.min(21, Math.max(6, map.getZoom() + amount)));
  }

  function moveToCurrentLocation() {
    const map = mapInstanceRef.current;
    if (!map || !navigator.geolocation) return;

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const position = new window.naver.maps.LatLng(
          coords.latitude,
          coords.longitude,
        );
        map.panTo(position);
        map.setZoom(16);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  return (
    <div className="relative h-full w-full">
      <Script
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`}
        strategy="afterInteractive"
        onReady={initMap}
      />
      <div ref={mapRef} className="h-full w-full" />

      <div className="absolute bottom-30 right-4 z-10 flex flex-col gap-2 md:bottom-5 md:right-5">
        <button
          type="button"
          onClick={moveToCurrentLocation}
          disabled={locating}
          aria-label="내 위치로 이동"
          title="내 위치로 이동"
          className="flex size-10 items-center justify-center rounded-lg border bg-background text-brand shadow-md transition-colors hover:bg-brand-soft disabled:cursor-wait disabled:opacity-60"
        >
          <LocateFixed
            className={`size-5 ${locating ? "animate-pulse" : ""}`}
            aria-hidden="true"
          />
        </button>

        <div className="overflow-hidden rounded-lg border bg-background shadow-md">
          <button
            type="button"
            onClick={() => changeZoom(1)}
            aria-label="지도 확대"
            className="flex size-10 items-center justify-center transition-colors hover:bg-brand-soft"
          >
            <Plus className="size-5" aria-hidden="true" />
          </button>
          <div
            className="flex h-7 min-w-10 items-center justify-center border-y px-1 font-anyvid text-[10px] text-muted-foreground"
            aria-live="polite"
          >
            레벨 {zoomLevel}
          </div>
          <button
            type="button"
            onClick={() => changeZoom(-1)}
            aria-label="지도 축소"
            className="flex size-10 items-center justify-center transition-colors hover:bg-brand-soft"
          >
            <Minus className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
