"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Home, Images, MapPin, Search, X } from "lucide-react";
import { cafes, cn, type Cafe } from "@/lib/utils";

interface GalleryImage {
  cafe: Cafe;
  src: string;
  rank: number;
}

// 이미지 경로를 숫자로 바꿔 서버와 브라우저에서 동일한 랜덤형 순서를 만든다.
function randomRank(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

const galleryImages: GalleryImage[] = cafes.flatMap((cafe) =>
  cafe.galleryImages
    .slice(0, -1)
    .map((src) => ({ cafe, src, rank: randomRank(src) })),
);

export function GalleryPage({ seed }: { seed: number }) {
  const [query, setQuery] = useState("");

  const filteredImages = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const matches = keyword
      ? galleryImages.filter(({ cafe }) =>
          [
            cafe.name,
            cafe.location.address,
            ...cafe.type,
            ...cafe.features,
          ].some((value) => value.toLowerCase().includes(keyword)),
        )
      : galleryImages;

    return [...matches].sort(
      (a, b) =>
        (Math.imul(a.rank ^ seed, 2246822519) >>> 0) -
        (Math.imul(b.rank ^ seed, 2246822519) >>> 0),
    );
  }, [query, seed]);

  return (
    <main className="min-h-dvh bg-[#fff3e5] text-[#191919]">
      <section className="w-full px-5 pt-6 pb-20 sm:px-8 sm:pt-10 lg:pb-28">
        <div className="mt-8 text-center">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-[#9cff75]">
            <Images className="size-9 text-[#3a241c]" />
          </span>

          <h1 className="font-paperlogy mt-3 text-[clamp(2.5rem,6vw,4.25rem)] font-semibold text-[#3a241c]">
            이미지로 카페를 만나보세요!
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#795f55] sm:text-base">
            마음에 드는 공간을 발견하고 카페의 이야기를 확인해 보세요.
          </p>
        </div>

        <div className="relative mx-auto mt-8 max-w-xl">
          <Search className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-stone-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="카페 이름, 지역, 특징으로 검색"
            className="w-full rounded-full border-2 border-[#3a241c] bg-white py-3.5 pr-12 pl-12 text-sm text-[#3a241c] shadow-[4px_4px_0_#3a241c] outline-none transition-shadow placeholder:text-[#b3a097] focus:shadow-[2px_2px_0_#3a241c]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="검색어 지우기"
              className="absolute top-1/2 right-5 -translate-y-1/2 text-stone-500 hover:text-[#3a241c]"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {filteredImages.length ? (
          <div className="mt-16 columns-1 gap-5 sm:columns-2 md:columns-3 lg:columns-4 2xl:columns-5 min-[1920px]:columns-6">
            {filteredImages.map((image, index) => (
              <GalleryCard
                key={image.src}
                image={image}
                priority={index < 4}
              />
            ))}
          </div>
        ) : (
          <div className="mt-16 rounded-3xl bg-white py-20 text-center text-sm text-stone-500 shadow-[0_16px_35px_rgba(145,75,0,0.12)]">
            조건에 맞는 이미지가 없어요. 검색어를 변경해 보세요.
          </div>
        )}
      </section>

      <Link
        href="/"
        aria-label="홈으로"
        className="fixed bottom-6 left-5 z-50 grid size-14 place-items-center rounded-full bg-[#9cff75] text-[#3a241c] shadow-[0_10px_24px_rgba(58,36,28,0.25)] transition-transform hover:-translate-y-0.5 sm:bottom-8 sm:left-8 sm:size-16"
      >
        <Home className="size-6 sm:size-7" />
      </Link>
    </main>
  );
}

function GalleryCard({
  image,
  priority,
}: {
  image: GalleryImage;
  priority: boolean;
}) {
  const { cafe, src, rank } = image;
  const aspectRatio = ["aspect-4/5", "aspect-square", "aspect-3/4"][rank % 3];

  return (
    <Link
      href={`/blog#${cafe.slug}`}
      aria-label={`${cafe.name} 카페 이야기 보기`}
      className={cn(
        "group relative mb-5 block break-inside-avoid overflow-hidden rounded-3xl bg-stone-200 shadow-[0_12px_28px_rgba(58,36,28,0.14)] outline-none",
        aspectRatio,
      )}
    >
      <Image
        src={src}
        alt={`${cafe.name} 공간 이미지`}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        priority={priority}
        className="object-cover transition duration-500 group-hover:scale-105 group-hover:brightness-60 group-focus-visible:scale-105 group-focus-visible:brightness-60"
      />

      <div className="absolute inset-0 flex translate-y-3 flex-col justify-end bg-linear-to-t from-black/85 via-black/35 to-transparent p-5 text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 sm:p-6">
        <p className="flex items-center gap-1 text-xs text-white/80">
          <MapPin className="size-3.5" />
          {cafe.province}
        </p>
        <h2 className="font-paperlogy mt-1 text-2xl font-semibold">
          {cafe.name}
        </h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {cafe.features.slice(0, 3).map((feature) => (
            <span
              key={feature}
              className="rounded-full border border-white/35 bg-white/15 px-2.5 py-1 text-[11px] backdrop-blur-sm"
            >
              {feature}
            </span>
          ))}
        </div>
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[#9cff75]">
          카페 이야기 보기
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
