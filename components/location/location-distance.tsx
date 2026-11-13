"use client";

import { Navigation } from "lucide-react";
import { useLocation } from "@/components/location/location-provider";
import { cn, distanceBetween, formatDistance } from "@/lib/utils";

// 내 위치에서 카페까지의 거리. 내 위치가 없으면 아무것도 그리지 않는다.
// 카드·목록·이미지·지도 페이지에서 같이 쓴다.
export function LocationDistance({
  latitude,
  longitude,
  className,
}: {
  latitude: number;
  longitude: number;
  className?: string;
}) {
  const { location } = useLocation();
  if (!location) return null;

  const distance = distanceBetween(
    location.latitude,
    location.longitude,
    latitude,
    longitude,
  );

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-bold whitespace-nowrap",
        className,
      )}
    >
      <Navigation aria-hidden="true" className="size-3 shrink-0" />
      <span className="sr-only">내 위치에서</span>
      {formatDistance(distance)}
    </span>
  );
}
