"use client";

import Image from "next/image";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";

import {
  getMarkerContent,
  type NaverMapInstance,
} from "@/components/page/page-map-prop";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 이미지가 빨리 떠도 로딩 애니메이션을 최소한 이 시간(ms)만큼은 보여준다.
const MIN_LOADING_MS = 500;

// 이전 페이지로 돌아간다.
// 지도 마커처럼 새 탭으로 열려 뒤로 갈 기록이 없으면, 이 페이지를 연 사이트 내 페이지(referrer)로 이동한다.
export function BackButton() {
  const router = useRouter();

  function handleClick() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    const referrer = document.referrer ? new URL(document.referrer) : null;
    if (referrer && referrer.origin === window.location.origin) {
      router.push(`${referrer.pathname}${referrer.search}`);
    } else {
      router.push("/");
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="이전 페이지로 돌아가기"
      onClick={handleClick}
      className="size-10 rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-md hover:bg-white hover:text-bark"
    >
      <ArrowLeft className="size-4" />
    </Button>
  );
}

// 갤러리 사진. 원본이 모두 3:4(960×1280)라 같은 비율 칸에 맞춰 넣고, 불러오는 동안 로딩 애니메이션을 보여준다.
export function DetailGalleryImage({ src, alt }: { src: string; alt: string }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );
  const [minDelayDone, setMinDelayDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinDelayDone(true), MIN_LOADING_MS);
    return () => clearTimeout(timer);
  }, []);

  // 불러오지 못한 사진은 보여주지 않는다.
  if (status === "error") return null;

  const isLoading = status === "loading" || !minDelayDone;

  return (
    <figure className="relative aspect-3/4 overflow-hidden rounded-2xl bg-stone-200">
      {isLoading && (
        <div className="absolute inset-0 grid place-items-center">
          <Loader2
            aria-label="이미지 불러오는 중"
            className="size-8 animate-spin text-autumn"
          />
        </div>
      )}
      {/* Next 이미지 최적화(/_next/image)를 거치지 않고 GitHub 주소에서 바로 불러온다. (서버 트래픽 절약) */}
      <Image
        unoptimized
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 1023px) 50vw, 33vw"
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        className={cn(
          "object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
        )}
      />
    </figure>
  );
}

// 카페 한 곳의 위치를 지도 페이지와 같은 마커로 네이버 지도에 보여준다.
export function CafeLocationMap({
  slug,
  name,
  naverRating,
  latitude,
  longitude,
}: {
  slug: string;
  name: string;
  naverRating: number | null;
  latitude: number;
  longitude: number;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<NaverMapInstance | null>(null);

  // 지도 스크립트가 준비되면 호출된다. 실제 생성은 지도 영역 크기가 정해진 뒤에 한다.
  function initMap() {
    const naver = window.naver;
    if (!naver || !mapRef.current || instanceRef.current) return;

    // 지도 영역 크기가 0이면 그 크기로 그려져 일부가 회색으로 남으므로, 크기가 생기면 아래 ResizeObserver가 다시 부른다.
    const { width, height } = mapRef.current.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    const position = new naver.maps.LatLng(latitude, longitude);
    const map = new naver.maps.Map(mapRef.current, {
      center: position,
      zoom: 16,
    });
    instanceRef.current = map;
    new naver.maps.Marker({
      position,
      map,
      title: name,
      icon: {
        content: getMarkerContent({ slug, name, naverRating }),
        anchor: new naver.maps.Point(130, 52),
      },
    });
  }

  const initMapOnResize = useEffectEvent(initMap);

  // 지도 영역 크기가 바뀌면 지도에 새 크기를 알리고, 카페가 가운데 오도록 다시 맞춘다. (회색 영역 방지)
  useEffect(() => {
    const element = mapRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      const naver = window.naver;
      const map = instanceRef.current;
      const { width, height } = entry.contentRect;
      if (!naver || width === 0 || height === 0) return;

      if (!map) {
        initMapOnResize();
        return;
      }
      map.setSize(new naver.maps.Size(width, height));
      map.setCenter(new naver.maps.LatLng(latitude, longitude));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [latitude, longitude]);

  return (
    <>
      <Script
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`}
        onReady={initMap}
      />
      <div
        ref={mapRef}
        role="img"
        aria-label={`${name} 위치 지도`}
        className="h-80 w-full bg-stone-100 sm:h-105"
      />
    </>
  );
}
