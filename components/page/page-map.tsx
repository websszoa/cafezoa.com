"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

interface NaverMapApi {
  maps: {
    LatLng: new (latitude: number, longitude: number) => unknown;
    Map: new (
      element: HTMLElement,
      options: { center: unknown; zoom: number },
    ) => unknown;
  };
}

// page-map2.tsx도 window.naver를 전역으로 선언하므로, 충돌을 피하기 위해
// 전역 Window 인터페이스를 확장하지 않고 이 파일 안에서만 좁혀서 쓴다.
function getNaverMaps(): NaverMapApi | undefined {
  return (window as unknown as { naver?: NaverMapApi }).naver;
}

const naverMapClientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

export default function PageMap() {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const initializeMap = useCallback(() => {
    const naver = getNaverMaps();
    if (!mapElementRef.current || !naver || mapInstanceRef.current) {
      return;
    }

    mapInstanceRef.current = new naver.maps.Map(mapElementRef.current, {
      center: new naver.maps.LatLng(36.35, 127.8),
      zoom: 9,
    });
  }, []);

  // afterInteractive 스크립트는 클라이언트 네비게이션 간 재사용되어
  // onReady가 다시 호출되지 않는 경우가 있어, 마운트 시에도 한 번 시도한다.
  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  if (!naverMapClientId) {
    return (
      <main className="fixed inset-0 grid place-items-center bg-[#fff3e5] px-5 text-center text-sm text-[#3a241c]">
        <p className="rounded-2xl bg-white px-6 py-4 shadow-lg">
          네이버 지도 클라이언트 ID가 없습니다.
        </p>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#e9edf2]">
      <Script
        id="naver-maps-sdk"
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(naverMapClientId)}`}
        strategy="afterInteractive"
        onReady={initializeMap}
        onError={() => setErrorMessage("네이버 지도를 불러오지 못했습니다.")}
      />
      <div ref={mapElementRef} className="size-full" aria-label="네이버 지도" />
      {errorMessage && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-sm font-bold text-[#3a241c]">
          {errorMessage}
        </div>
      )}
    </main>
  );
}
