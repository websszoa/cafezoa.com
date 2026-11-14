"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { CafeCard, type CafeCardData } from "@/components/page/page-card-prop";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  RotateCcw,
  SearchX,
  SlidersHorizontal,
} from "lucide-react";

// 화면 구조: [취향 고르기][카드][카드]… 모든 칸은 카드 기본 폭 380px, 간격 24px로 같다.
// 화면이 넓어질수록 칸이 하나씩 늘어난다. (n칸에 필요한 화면 폭 = 380n + 24(n-1) + 좌우 패딩 64)
//   - 832px 미만: 위아래 배치. 취향 고르기는 접어 두고, 아래에 카드 목록 (카드 페이지와 같은 방식)
//   - 832px~: 2칸(필터 + 카드 1) / 1236px~: 3칸 / 1640px~: 4칸 / 2044px~: 5칸 / 2448px~: 6칸
// 취향으로 고를 수 있는 항목 묶음: 유형(basic.type), 뷰·서비스·목적·특징·주차·반려동물·공부·흡연(details)
export type TasteKey =
  | "types"
  | "view"
  | "services"
  | "purpose"
  | "features"
  | "parking"
  | "pet"
  | "study"
  | "smoking";

export type TasteGroup = { key: TasteKey; title: string; options: string[] };

export type TasteCafe = {
  card: CafeCardData;
  tags: Record<TasteKey, string[]>;
};

type Selected = Record<TasteKey, string[]>;

const EMPTY_SELECTED: Selected = {
  types: [],
  view: [],
  services: [],
  purpose: [],
  features: [],
  parking: [],
  pet: [],
  study: [],
  smoking: [],
};

const TASTE_KEYS = Object.keys(EMPTY_SELECTED) as TasteKey[];

// 고른 항목을 모두 가진 카페만 보여준다. (같은 묶음 안에서도, 묶음끼리도 모두 맞아야 한다)
// 예) 유형 [대형카페, 전망카페] + 서비스 [브런치] → 대형카페이면서 전망카페이고 브런치가 있는 카페
function matches(cafe: TasteCafe, selected: Selected) {
  return TASTE_KEYS.every((key) =>
    selected[key].every((value) => cafe.tags[key].includes(value)),
  );
}

export function TasteFinder({
  cafes,
  groups,
}: {
  cafes: TasteCafe[];
  groups: TasteGroup[];
}) {
  const [selected, setSelected] = useState<Selected>(EMPTY_SELECTED);
  // 모바일에서는 항목이 많아 처음엔 접어 둔다. (데스크톱은 항상 펼침)
  const [filterOpen, setFilterOpen] = useState(false);

  const selectedCount = TASTE_KEYS.reduce(
    (sum, key) => sum + selected[key].length,
    0,
  );

  const results = useMemo(
    () => cafes.filter((cafe) => matches(cafe, selected)),
    [cafes, selected],
  );

  // 항목 옆 숫자: 지금 고른 조건에 이 항목을 더하면 나오는 카페 수 (0이면 고를 수 없다)
  const counts = useMemo(() => {
    const result = {} as Record<TasteKey, Map<string, number>>;
    for (const key of TASTE_KEYS) {
      const map = new Map<string, number>();
      for (const cafe of results) {
        for (const value of cafe.tags[key]) {
          map.set(value, (map.get(value) ?? 0) + 1);
        }
      }
      result[key] = map;
    }
    return result;
  }, [results]);

  const toggle = (key: TasteKey, value: string) =>
    setSelected((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((item) => item !== value)
        : [...prev[key], value],
    }));

  const reset = () => setSelected(EMPTY_SELECTED);

  return (
    <div className="flex flex-col gap-6 min-[832px]:flex-row min-[832px]:items-start min-[832px]:justify-center">
      <aside className="min-[832px]:sticky min-[832px]:top-6 min-[832px]:w-95 min-[832px]:shrink-0">
        <div className="rounded-[1.6rem] bg-white p-6 shadow-[0_16px_35px_rgba(145,75,0,0.12)] min-[832px]:max-h-[calc(100vh-3rem)] min-[832px]:overflow-y-auto">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-paperlogy flex items-center gap-2 text-xl font-semibold text-bark">
              <SlidersHorizontal
                aria-hidden="true"
                className="size-5 text-autumn"
              />
              취향 고르기
            </h2>
            <button
              type="button"
              onClick={reset}
              disabled={selectedCount === 0}
              className="inline-flex items-center gap-1 text-[13px] font-bold text-autumn transition-colors hover:text-bark disabled:pointer-events-none disabled:text-[#bbb]"
            >
              <RotateCcw aria-hidden="true" className="size-3.5" />
              초기화
            </button>
          </div>

          <button
            type="button"
            onClick={() => setFilterOpen((open) => !open)}
            aria-expanded={filterOpen}
            aria-controls="taste-filters"
            className="mt-4 flex w-full items-center justify-between rounded-full border-2 border-bark px-4 py-2 text-sm font-bold text-bark min-[832px]:hidden"
          >
            {selectedCount > 0 ? `${selectedCount}개 선택됨` : "항목 펼치기"}
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "size-4 transition-transform",
                filterOpen && "rotate-180",
              )}
            />
          </button>

          <div
            id="taste-filters"
            className={cn("mt-6 space-y-7", !filterOpen && "hidden min-[832px]:block")}
          >
            {groups.map(({ key, title, options }) => (
              <fieldset key={key}>
                <legend className="mb-3 flex items-center gap-1.5 text-sm font-bold text-bark">
                  {title}
                  {selected[key].length > 0 && (
                    <span className="rounded-full bg-leaf px-1.5 text-[11px] leading-5 text-bark">
                      {selected[key].length}
                    </span>
                  )}
                </legend>
                <div className="flex flex-wrap gap-1.5">
                  {options.map((option) => {
                    const checked = selected[key].includes(option);
                    const count = counts[key].get(option) ?? 0;
                    const disabled = !checked && count === 0;
                    return (
                      <label
                        key={option}
                        className={cn(
                          "inline-flex cursor-pointer items-center gap-1 rounded-full border-2 px-3 py-1 text-[13px] font-medium transition-colors has-focus-visible:ring-3 has-focus-visible:ring-autumn/40",
                          checked
                            ? "border-autumn bg-autumn text-white"
                            : "border-[#ead9ca] text-[#444] hover:border-autumn hover:text-autumn",
                          disabled &&
                            "cursor-not-allowed opacity-40 hover:border-[#ead9ca] hover:text-[#444]",
                        )}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => toggle(key, option)}
                        />
                        {option}
                        <span
                          className={cn(
                            "text-[11px]",
                            checked ? "text-white/80" : "text-[#aaa]",
                          )}
                        >
                          {count}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
        </div>
      </aside>

      <section aria-labelledby="taste-results" className="min-[832px]:w-95 min-[1236px]:w-196 min-[1640px]:w-[1188px] min-[2044px]:w-[1592px] min-[2448px]:w-[1996px]">
        <h2
          id="taste-results"
          aria-live="polite"
          className="font-paperlogy mb-5 text-xl text-white sm:text-2xl"
        >
          {selectedCount > 0
            ? `취향에 맞는 카페 ${results.length}곳이 있어요!`
            : `전체 카페 ${results.length}곳이 있어요!`}
        </h2>

        {results.length > 0 ? (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-[repeat(auto-fill,380px)] sm:justify-center min-[832px]:grid-cols-[380px] min-[1236px]:grid-cols-[repeat(2,380px)] min-[1640px]:grid-cols-[repeat(3,380px)] min-[2044px]:grid-cols-[repeat(4,380px)] min-[2448px]:grid-cols-[repeat(5,380px)]">
            {results.map(({ card }, index) => (
              <CafeCard
                key={card.slug}
                {...card}
                heading="h3"
                eager={index < 3}
              />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center rounded-[1.6rem] bg-white px-6 py-16 text-center shadow-[0_16px_35px_rgba(145,75,0,0.12)]">
            <SearchX aria-hidden="true" className="size-10 text-autumn" />
            <p className="font-paperlogy mt-4 text-xl font-semibold text-bark">
              딱 맞는 카페가 아직 없어요
            </p>
            <p className="mt-2 text-sm text-[#666]">
              고른 항목을 조금 줄여 보세요.
            </p>
            <Button variant="seed" onClick={reset} className="mt-6">
              <RotateCcw aria-hidden="true" className="size-4" />
              처음부터 다시 고르기
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
