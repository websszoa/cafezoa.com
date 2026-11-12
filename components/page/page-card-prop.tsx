"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// 이미지가 빨리 떠도 로딩 애니메이션을 최소한 이 시간(ms)만큼은 보여준다.
const MIN_LOADING_MS = 500;

// 카드 그리드 설정: 카드 폭·간격(px)과 한 번에 보여줄 줄 수.
const CARD_WIDTH = 380;
const CARD_GAP = 24;
const ROWS_PER_PAGE = 2;

export type CafeCardData = Omit<CafeCardProps, "eager">;

// 화면에 들어가는 칸 수에 맞춰 처음엔 2줄만 보여주고, 끝까지 스크롤하면 2줄씩 더 보여준다.
export function CafeCardGrid({ cafes }: { cafes: CafeCardData[] }) {
  const listRef = useRef<HTMLUListElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(3);
  const [rows, setRows] = useState(ROWS_PER_PAGE);

  // 그리드 폭이 바뀔 때마다 한 줄에 들어가는 카드 수를 다시 계산한다. (640px 미만은 1칸)
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      const next =
        window.innerWidth < 640
          ? 1
          : Math.max(
              1,
              Math.floor((width + CARD_GAP) / (CARD_WIDTH + CARD_GAP)),
            );
      setColumns(next);
    });
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  const visibleCount = columns * rows;
  const hasMore = visibleCount < cafes.length;

  // 목록 끝의 감지용 요소가 화면 근처에 오면 2줄을 더 연다.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setRows((prev) => prev + ROWS_PER_PAGE);
      },
      { rootMargin: "300px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, visibleCount]);

  return (
    <>
      <ul
        ref={listRef}
        className="grid grid-cols-1 gap-6 sm:grid-cols-[repeat(auto-fill,380px)] sm:justify-center"
      >
        {cafes.slice(0, visibleCount).map((cafe, index) => (
          <CafeCard key={cafe.slug} {...cafe} eager={index < 4} />
        ))}
      </ul>
      {hasMore && (
        <div ref={sentinelRef} className="mt-10 flex justify-center">
          <Loader2
            aria-label="카페 더 불러오는 중"
            className="size-8 animate-spin text-white"
          />
        </div>
      )}
    </>
  );
}

type CafeCardProps = {
  slug: string;
  name: string;
  types: string[];
  address: string;
  description: string;
  image: string;
  naverRating: number | null;
  // 첫 화면에 보이는 카드는 이미지를 바로 불러온다. (LCP 개선)
  eager?: boolean;
};

export function CafeCard({
  slug,
  name,
  types,
  address,
  description,
  image,
  naverRating,
  eager = false,
}: CafeCardProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );

  const [minDelayDone, setMinDelayDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinDelayDone(true), MIN_LOADING_MS);
    return () => clearTimeout(timer);
  }, []);

  // 대표 이미지를 불러오지 못한 카페는 카드 자체를 보여주지 않는다.
  if (status === "error") return null;

  const isLoading = status === "loading" || !minDelayDone;

  return (
    <li>
      <article
        id={slug}
        className="group flex h-full min-h-145 scroll-mt-6 flex-col overflow-hidden rounded-[1.6rem] bg-white shadow-[0_16px_35px_rgba(145,75,0,0.12)]"
      >
        <div className="relative aspect-4/4 shrink-0 overflow-hidden bg-[#eee]">
          {isLoading && (
            <div className="absolute inset-0 grid place-items-center">
              <Loader2
                aria-label="이미지 불러오는 중"
                className="size-8 animate-spin text-autumn"
              />
            </div>
          )}
          <Image
            src={image}
            alt={`${name} 전경`}
            fill
            sizes="(max-width: 639px) 100vw, 380px"
            loading={eager ? "eager" : "lazy"}
            className={cn(
              "object-cover transition-opacity duration-300",
              isLoading ? "opacity-0" : "opacity-100",
            )}
            onLoad={() => setStatus("loaded")}
            onError={() => setStatus("error")}
          />
          {naverRating !== null && (
            <span className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-linear-to-r from-autumn to-[#7d16ed] px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
              <Star aria-hidden="true" className="size-3.5 fill-white" />
              네이버 {naverRating.toFixed(1)}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <div className="flex flex-wrap gap-1.5">
            {types.slice(0, 3).map((type) => (
              <span key={type} className="text-sm font-bold text-autumn">
                #{type.replace(/\s+/g, "")}
              </span>
            ))}
          </div>
          <h2 className="font-paperlogy mt-2 truncate text-3xl font-semibold tracking-[-0.04em] text-bark">
            {name}
          </h2>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-[#444]">
            <MapPin
              aria-hidden="true"
              className="size-4 shrink-0 text-autumn"
            />
            {address}
          </p>
          <p className="mt-4 line-clamp-4 text-sm leading-6 text-[#666]">
            {description}
          </p>
        </div>
      </article>
    </li>
  );
}
