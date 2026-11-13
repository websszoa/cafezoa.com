"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { LocationDistance } from "@/components/location/location-distance";
import { cn } from "@/lib/utils";

export type GalleryImage = {
  src: string;
  rank: number;
  slug: string;
  name: string;
  province: string;
  // 카페 좌표. 내 위치를 켜면 거리 표시에 쓴다.
  latitude: number;
  longitude: number;
  features: string[];
};

// 한 번에 20장씩만 그리고, 아래로 내리면 20장씩 더 보여준다.
const PAGE_SIZE = 20;

// 이미지가 빨리 떠도 로딩 애니메이션을 최소한 이 시간(ms)만큼은 보여준다.
const MIN_LOADING_MS = 500;

// 사진마다 비율을 달리해 벽돌(masonry) 느낌을 낸다. rank로 정해서 서버·브라우저 결과가 같다.
const CARD_ASPECTS = [
  { className: "aspect-4/5", ratio: 4 / 5 },
  { className: "aspect-square", ratio: 1 },
  { className: "aspect-3/4", ratio: 3 / 4 },
] as const;

function aspectOf(rank: number) {
  return CARD_ASPECTS[rank % CARD_ASPECTS.length];
}

// 화면 너비에 따른 컬럼 수.
function columnCountOf(width: number) {
  if (width >= 1920) return 6;
  if (width >= 1536) return 5;
  if (width >= 1024) return 4;
  if (width >= 768) return 3;
  if (width >= 640) return 2;
  return 1;
}

// 사진을 순서대로 "가장 짧은 컬럼"에 쌓는다. 이미 놓인 사진은 다시 움직이지 않는다.
function distributeIntoColumns(images: GalleryImage[], columnCount: number) {
  const columns: { image: GalleryImage; index: number }[][] = Array.from(
    { length: columnCount },
    () => [],
  );
  const columnHeights = new Array(columnCount).fill(0);

  images.forEach((image, index) => {
    let shortest = 0;
    for (let col = 1; col < columnCount; col += 1) {
      if (columnHeights[col] < columnHeights[shortest]) shortest = col;
    }
    columns[shortest].push({ image, index });
    columnHeights[shortest] += 1 / aspectOf(image.rank).ratio;
  });

  return columns;
}

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [columnCount, setColumnCount] = useState(1);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 서버에서는 화면 너비를 모르니 1컬럼으로 그리고, 마운트 후 실제 너비에 맞춘다.
  useEffect(() => {
    const update = () => setColumnCount(columnCountOf(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const columns = useMemo(
    () => distributeIntoColumns(images.slice(0, visibleCount), columnCount),
    [images, visibleCount, columnCount],
  );
  const hasMore = visibleCount < images.length;

  // 하단 감지 영역이 화면 근처에 오면 20장씩 더 보여준다.
  useEffect(() => {
    if (!hasMore) return;
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisibleCount((count) => count + PAGE_SIZE);
      },
      { rootMargin: "600px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore]);

  return (
    <>
      <div className="flex gap-5">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="flex flex-1 flex-col gap-5">
            {column.map(({ image, index }) => (
              <GalleryCard key={image.src} image={image} priority={index < 4} />
            ))}
          </div>
        ))}
      </div>
      {hasMore && (
        <div ref={loadMoreRef} className="mt-10 flex justify-center">
          <Loader2
            aria-label="이미지 더 불러오는 중"
            className="size-6 animate-spin text-white"
          />
        </div>
      )}
    </>
  );
}

function GalleryCard({
  image,
  priority,
}: {
  image: GalleryImage;
  priority: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [minDelayDone, setMinDelayDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinDelayDone(true), MIN_LOADING_MS);
    return () => clearTimeout(timer);
  }, []);

  const isLoading = !loaded || !minDelayDone;

  return (
    <figure
      className={cn(
        "group relative overflow-hidden rounded-3xl bg-stone-200 shadow-[0_12px_28px_rgba(58,36,28,0.14)]",
        aspectOf(image.rank).className,
      )}
    >
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
        src={image.src}
        alt={`${image.name} 공간 이미지`}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        priority={priority}
        onLoad={() => setLoaded(true)}
        className={cn(
          "object-cover transition duration-500 sm:group-hover:scale-105 sm:group-hover:brightness-60",
          isLoading ? "opacity-0" : "opacity-100",
        )}
      />

      {/* 호버가 없는 모바일에서는 지역·이름을 항상 보이는 얇은 캡션으로 보여준다. */}
      <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-4 pt-8 text-white sm:hidden">
        <p className="flex items-center gap-1 text-[11px] text-white/80">
          <MapPin aria-hidden="true" className="size-3" />
          {image.province}
          <LocationDistance
            latitude={image.latitude}
            longitude={image.longitude}
            className="ml-1 text-leaf"
          />
        </p>
        <p className="font-paperlogy mt-0.5 truncate text-base font-semibold">
          {image.name}
        </p>
      </figcaption>

      <div
        aria-hidden="true"
        className="absolute inset-0 hidden translate-y-3 flex-col justify-end bg-linear-to-t from-black/85 via-black/35 to-transparent p-6 text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:flex"
      >
        <p className="flex items-center gap-1 text-xs text-white/80">
          <MapPin className="size-3.5" />
          {image.province}
          <LocationDistance
            latitude={image.latitude}
            longitude={image.longitude}
            className="ml-1 text-leaf"
          />
        </p>
        <p className="font-paperlogy mt-1 text-2xl font-semibold">
          {image.name}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {image.features.slice(0, 3).map((feature) => (
            <span
              key={feature}
              className="rounded-full border border-white/35 bg-white/15 px-2.5 py-1 text-[11px] backdrop-blur-sm"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </figure>
  );
}
