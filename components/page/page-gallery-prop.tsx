"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { LocationDistance } from "@/components/location/location-distance";
import { cn } from "@/lib/utils";

export type GalleryImage = {
  src: string;
  // 사진 설명 (data/cafe-details.json 의 gallery[].alt). 비어 있으면 기본 설명을 쓴다.
  alt: string;
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

// seed로 정해지는 섞기. (같은 seed면 같은 순서 → 화면을 다시 그려도 순서가 유지된다)
function shuffleWithSeed<T>(items: T[], seed: number) {
  const result = [...items];
  let state = Math.floor(seed * 2 ** 32) || 1;
  const next = () => {
    // mulberry32: 간단한 의사 난수
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [columnCount, setColumnCount] = useState(1);
  // 들어올 때마다 다른 순서로 보여주기 위한 값. 서버에서 만든 HTML은 기본 순서(null)이고,
  // 브라우저에서 화면이 뜬 직후 칸 수를 맞출 때 함께 섞는다.
  const [shuffleSeed, setShuffleSeed] = useState<number | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 서버에서는 화면 너비를 모르니 1컬럼으로 그리고, 마운트 후 실제 너비에 맞춘다.
  useEffect(() => {
    const update = () => setColumnCount(columnCountOf(window.innerWidth));
    const shuffle = () => setShuffleSeed(Math.random());
    update();
    shuffle();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const orderedImages = useMemo(
    () =>
      shuffleSeed === null ? images : shuffleWithSeed(images, shuffleSeed),
    [images, shuffleSeed],
  );
  const columns = useMemo(
    () =>
      distributeIntoColumns(orderedImages.slice(0, visibleCount), columnCount),
    [orderedImages, visibleCount, columnCount],
  );
  const hasMore = visibleCount < orderedImages.length;

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

  // 사진을 누르면 그 카페의 상세 페이지로 이동한다.
  return (
    <Link
      href={`/cafe/${image.slug}`}
      aria-label={`${image.name} 상세 정보 보기`}
      className="block rounded-3xl outline-none focus-visible:ring-4 focus-visible:ring-white/70"
    >
      <figure
        className={cn(
          "group relative overflow-hidden rounded-3xl bg-cream shadow-[0_12px_28px_rgba(58,36,28,0.14)]",
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
          alt={
            image.alt
              ? `${image.name} ${image.alt}`
              : `${image.name} 공간 이미지`
          }
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
    </Link>
  );
}
