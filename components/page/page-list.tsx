"use client";

import Image from "next/image";
import Link from "next/link";
import { cafes, cn, type Cafe } from "@/lib/utils";
import { useMemo, useState } from "react";
import {
  Armchair,
  BookOpenCheck,
  Cigarette,
  CircleParking,
  Clock,
  Coffee,
  Eye,
  Home,
  LayoutList,
  MapPin,
  PawPrint,
  Search,
  Star,
  X,
} from "lucide-react";

export function ListPage() {
  const [query, setQuery] = useState("");

  const filteredCafes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cafes
      .filter((cafe) => {
        const matchesQuery =
          !q ||
          cafe.name.toLowerCase().includes(q) ||
          cafe.location.address.toLowerCase().includes(q) ||
          cafe.type.some((type) => type.toLowerCase().includes(q));
        return matchesQuery;
      })
      .sort((a, b) => (b.naver?.[1] ?? 0) - (a.naver?.[1] ?? 0));
  }, [query]);

  return (
    <main className="min-h-dvh bg-[#fff3e5] text-[#191919]">
      <section className="mx-auto max-w-screen-2xl px-5 pt-6 pb-20 sm:px-8 sm:pt-10 lg:pb-28">
        <div className="mt-8 text-center">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-[#9cff75]">
            <LayoutList className="size-9 text-[#3a241c]" />
          </span>

          <h1 className="font-paperlogy mt-3 text-[clamp(2.5rem,6vw,4.25rem)] font-semibold text-[#3a241c]">
            카페를 비교해보세요!
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#795f55] sm:text-base">
            전국의 개성 있는 카페 {cafes.length}곳을 한눈에 살펴보세요.
          </p>
        </div>

        <div className="relative mx-auto mt-8 max-w-xl">
          <Search className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-stone-500" />
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
              className="absolute top-1/2 right-5 -translate-y-1/2 text-stone-500 hover:text-[#3a241c]"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {filteredCafes.length === 0 ? (
          <div className="mt-9 rounded-3xl bg-white py-20 text-center text-sm text-stone-500 shadow-[0_16px_35px_rgba(145,75,0,0.12)]">
            조건에 맞는 카페가 없어요. 검색어나 필터를 변경해 보세요.
          </div>
        ) : (
          <CafeTable cafes={filteredCafes} />
        )}
      </section>

      <Link
        href="/"
        aria-label="홈으로"
        className="fixed bottom-6 left-5 z-50 grid size-14 place-items-center rounded-full bg-[#9cff75] text-[#3a241c] transition-transform hover:-translate-y-0.5 sm:bottom-8 sm:left-8 sm:size-16"
      >
        <Home className="size-6 sm:size-7" />
      </Link>
    </main>
  );
}

function CafeTable({ cafes }: { cafes: Cafe[] }) {
  return (
    <div className="mt-16 overflow-hidden rounded-3xl bg-white shadow-[0_16px_35px_rgba(145,75,0,0.12)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-295 border-collapse text-left text-sm">
          <tbody>
            {cafes.map((cafe, index) => (
              <tr
                key={cafe.slug}
                className={cn(
                  "transition-colors hover:bg-[#fff1da]",
                  index % 2 === 1 && "bg-[#fffaf2]",
                )}
              >
                <td className="px-5 py-4 pr-0 align-middle">
                  <div className="flex min-w-10 flex-col items-center">
                    <span className="font-nanum-square-neo text-lg text-[#c3957a]">
                      {index + 1}
                    </span>
                    {cafe.naver && (
                      <span className="mt-1 inline-flex items-center gap-0.5 text-[12px] font-bold whitespace-nowrap text-[#795f55]">
                        <Star className="size-3 fill-[#ff5b20] text-[#ff5b20]" />
                        {cafe.naver[1].toFixed(2)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 align-middle">
                  <Link
                    href={`/cafe/${cafe.slug}`}
                    aria-label={`${cafe.name} 상세 정보 보기`}
                    className="flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#ff5b20]"
                  >
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded">
                      <Image
                        src={cafe.thumbnail}
                        alt={cafe.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-paperlogy truncate text-xl font-semibold text-[#3a241c]">
                        {cafe.name}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-sm whitespace-nowrap text-[#3a241c]">
                        <MapPin className="size-3.5 text-[#ff5b20] shrink-0" />
                        {cafe.location.address}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <CircleParking
                          aria-label={`주차 ${cafe.parkingLabels?.[0] ?? "정보 없음"}`}
                          className={cn(
                            "size-3.5",
                            cafe.isParkingFree
                              ? "text-[#ff5b20]"
                              : "text-stone-300",
                          )}
                        >
                          <title>
                            주차 {cafe.parkingLabels?.[0] ?? "정보 없음"}
                          </title>
                        </CircleParking>
                        <BookOpenCheck
                          aria-label={`스터디 ${cafe.studyLabel ?? "정보 없음"}`}
                          className={cn(
                            "size-3.5",
                            cafe.studyLabel?.includes("가능")
                              ? "text-[#ff5b20]"
                              : "text-stone-300",
                          )}
                        >
                          <title>스터디 {cafe.studyLabel ?? "정보 없음"}</title>
                        </BookOpenCheck>
                        <Cigarette
                          aria-label={`흡연 ${cafe.smokingLabel ?? "정보 없음"}`}
                          className={cn(
                            "size-3.5",
                            cafe.smokingLabel?.includes("가능")
                              ? "text-[#ff5b20]"
                              : "text-stone-300",
                          )}
                        >
                          <title>흡연 {cafe.smokingLabel ?? "정보 없음"}</title>
                        </Cigarette>
                        <PawPrint
                          aria-label={`펫 ${cafe.petLabel}`}
                          className={cn(
                            "size-3.5",
                            cafe.petLabel === "가능"
                              ? "text-[#ff5b20]"
                              : "text-stone-300",
                          )}
                        >
                          <title>펫 {cafe.petLabel}</title>
                        </PawPrint>
                      </div>
                    </div>
                  </Link>
                </td>
                <td className="font-nanum-square-neo px-4 py-4 align-top text-sm whitespace-nowrap text-[#3a241c]">
                  <Eye className="mb-2 size-3.5 text-[#ff5b20]" />
                  {cafe.viewLabels?.length ? (
                    <div className="space-y-1">
                      {cafe.viewLabels.slice(0, 3).map((view) => (
                        <p key={view}>{view}</p>
                      ))}
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="font-nanum-square-neo px-4 py-4 align-top text-sm whitespace-nowrap text-[#3a241c]">
                  <Coffee className="mb-2 size-3.5 text-[#ff5b20]" />
                  {cafe.serviceLabels?.length ? (
                    <div className="space-y-1">
                      {cafe.serviceLabels.slice(0, 3).map((service) => (
                        <p key={service}>{service}</p>
                      ))}
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="font-nanum-square-neo px-4 py-4 align-top text-sm whitespace-nowrap text-[#3a241c]">
                  <Clock className="mb-2 size-3.5 text-[#ff5b20]" />
                  <div className="space-y-1">
                    {cafe.businessHoursLines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                    <p>{cafe.closedDays ?? "정보 없음"}</p>
                  </div>
                </td>
                <td className="font-nanum-square-neo px-4 py-4 align-top text-sm whitespace-nowrap text-[#3a241c]">
                  <CircleParking className="mb-2 size-3.5 text-[#ff5b20]" />
                  {cafe.parkingLabels?.length ? (
                    <div className="space-y-1">
                      {cafe.parkingLabels.slice(0, 3).map((parking) => (
                        <p key={parking}>{parking}</p>
                      ))}
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="font-nanum-square-neo px-4 py-4 align-top text-sm whitespace-nowrap text-[#3a241c]">
                  <Armchair className="mb-2 size-3.5 text-[#ff5b20]" />
                  {cafe.seatingLabels?.length ? (
                    <div className="space-y-1">
                      {cafe.seatingLabels.slice(0, 3).map((seating) => (
                        <p key={seating}>{seating}</p>
                      ))}
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
