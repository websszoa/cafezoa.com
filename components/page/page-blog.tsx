"use client";

import Image from "next/image";
import Link from "next/link";
import { cafes, cafeTypes, cn, type Cafe } from "@/lib/utils";
import { useMemo, useState } from "react";
import { Coffee, Home, MapPin, Search, Star, X } from "lucide-react";

export function BlogPage() {
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<string | null>(null);

  const filteredCafes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cafes.filter((cafe) => {
      const matchesQuery =
        !q ||
        cafe.name.toLowerCase().includes(q) ||
        cafe.location.address.toLowerCase().includes(q) ||
        cafe.type.some((type) => type.toLowerCase().includes(q));
      const matchesType = !activeType || cafe.type.includes(activeType);
      return matchesQuery && matchesType;
    });
  }, [query, activeType]);

  return (
    <main className="min-h-dvh bg-[#ff5b20] text-[#191919]">
      <section className="w-full px-5 pt-6 pb-20 sm:px-8 sm:pt-10 lg:pb-28">
        <div className="text-center mt-8">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-[#9cff75]">
            <Coffee className="size-9 text-[#3a241c]" />
          </span>

          <h1 className="font-paperlogy mt-3 text-[clamp(2.5rem,6vw,4.25rem)] font-semibold text-white">
            취향별 카페 이야기
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white sm:text-base">
            전국의 특별한 카페와 공간 이야기를 한곳에서 만나보세요.
          </p>
        </div>

        <div className="relative mx-auto mt-8 max-w-xl">
          <Search className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-[#9c8578]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="카페 이름, 지역으로 검색"
            className="w-full rounded-full border-2 border-[#3a241c] bg-white py-3.5 pr-12 pl-12 text-sm text-[#3a241c] shadow-[4px_4px_0_#3a241c] outline-none transition-shadow placeholder:text-[#b3a097] focus:shadow-[2px_2px_0_#3a241c]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="검색어 지우기"
              className="absolute top-1/2 right-5 -translate-y-1/2 text-[#9c8578] hover:text-[#3a241c]"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <nav
          className="mx-auto my-6 flex max-w-5xl flex-wrap justify-center gap-2 sm:mb-16"
          aria-label="카페 유형 필터"
        >
          <FilterPill
            active={activeType === null}
            onClick={() => setActiveType(null)}
          >
            전체
          </FilterPill>
          {cafeTypes.map((type) => (
            <FilterPill
              key={type}
              active={activeType === type}
              onClick={() =>
                setActiveType((prev) => (prev === type ? null : type))
              }
            >
              {type}
            </FilterPill>
          ))}
        </nav>

        {filteredCafes.length === 0 ? (
          <div className="mt-9 rounded-3xl bg-white/10 py-20 text-center text-sm text-white/80">
            조건에 맞는 카페가 없어요. 검색어나 필터를 변경해 보세요.
          </div>
        ) : (
          <div className="mt-9 grid gap-5 md:grid-cols-2 lg:mt-10 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 min-[1920px]:grid-cols-6">
            {filteredCafes.map((cafe, index) => (
              <CafeStoryCard key={cafe.slug} cafe={cafe} priority={index < 3} />
            ))}
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

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-full px-6 py-2 text-sm font-bold transition-colors sm:px-7 sm:py-2.5",
        active
          ? "bg-white text-[#ff5b20]"
          : "bg-white/25 text-white hover:bg-white/50",
      )}
    >
      {children}
    </button>
  );
}

function CafeStoryCard({ cafe, priority }: { cafe: Cafe; priority: boolean }) {
  return (
    <article
      id={cafe.slug}
      className="group flex min-h-145 scroll-mt-6 flex-col overflow-hidden rounded-[1.6rem] bg-white shadow-[0_16px_35px_rgba(145,75,0,0.12)]"
    >
      <div className="relative aspect-4/4 shrink-0 overflow-hidden bg-[#eee]">
        <Image
          src={cafe.thumbnail}
          alt={`${cafe.name} 전경`}
          fill
          sizes="(max-width:768px) 100vw, (max-width:1024px) 60vw, 33vw"
          loading={priority ? "eager" : "lazy"}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {cafe.naver && (
          <span className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-linear-to-r from-[#ff5b20] to-[#7d16ed] px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
            <Star className="size-3.5 fill-white" />
            네이버 {cafe.naver[1].toFixed(1)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex flex-wrap gap-1.5">
          {cafe.type.slice(0, 3).map((type) => (
            <span key={type} className="text-sm font-bold text-[#ff5b20]">
              #{type.replace(/\s+/g, "")}
            </span>
          ))}
        </div>
        <h2 className="font-paperlogy mt-2 text-3xl font-semibold tracking-[-0.04em]">
          {cafe.name}
        </h2>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-[#444]">
          <MapPin className="size-4 shrink-0 text-[#ff5b20]" />
          {cafe.location.address}
        </p>
        <p className="mt-4 line-clamp-4 text-sm leading-6 text-[#666]">
          {cafe.description}
        </p>
      </div>
    </article>
  );
}
