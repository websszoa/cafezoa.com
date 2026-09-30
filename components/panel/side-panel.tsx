"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { navigation } from "@/lib/menu";
import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Menu,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import {
  CAFES,
  DEFAULT_CAFE_FILTERS,
  filterCafes,
  type Cafe,
  type CafeFilters,
} from "@/lib/cafes";
import {
  AMENITIES,
  KIDS_POLICIES,
  PET_FRIENDLY_OPTIONS,
  REGIONS,
  SEAT_SIZES,
  THEME_COLLECTIONS,
  VIEW_TYPES,
  VISIT_TIPS,
} from "@/lib/filters";

import SideCafeCard from "./side-cafe-card";
import SideDetailPanel from "./side-detail-panel";

function toggleInArray<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

const availableRegions = REGIONS.filter((region) =>
  CAFES.some((cafe) => cafe.region === region.value),
);

export default function SidePanel({
  onCafeSelect,
}: {
  onCafeSelect?: (cafe: Cafe) => void;
}) {
  const [filters, setFilters] = useState<CafeFilters>(DEFAULT_CAFE_FILTERS);
  const [expanded, setExpanded] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCafeId, setSelectedCafeId] = useState<string | null>(null);

  const results = useMemo(() => filterCafes(CAFES, filters), [filters]);
  const activeFilterCount =
    (filters.query ? 1 : 0) +
    (filters.region !== "all" ? 1 : 0) +
    filters.viewTypes.length +
    (filters.kidsPolicy !== "all" ? 1 : 0) +
    filters.petFriendly.length +
    (filters.seatSize !== "all" ? 1 : 0) +
    filters.amenities.length +
    filters.visitTips.length;
  const selectedCafe = CAFES.find((cafe) => cafe.id === selectedCafeId);

  function resetFilters() {
    setFilters(DEFAULT_CAFE_FILTERS);
  }

  const content = (
    <div className="min-h-full bg-sidebar">
      <div className="relative flex h-14 items-center justify-between border-b bg-background px-5">
        <Link
          href="/"
          className="group flex items-center gap-1 text-foreground"
          aria-label="카페조아 홈"
        >
          <span className="fontzoa-sc-dream-light text-xl tracking-tight">
            cafe<span className="text-brand">zoa</span>
          </span>
          <span className="relative flex size-8 items-center justify-center">
            <span className="cafe-logo-bean" aria-hidden="true">
              <span className="cafe-logo-bean-seam" />
            </span>
            <span
              className="absolute bottom-1 h-1 w-6 rounded-full bg-brand/15 transition-transform duration-300 group-hover:scale-x-75"
              aria-hidden="true"
            />
          </span>
        </Link>

        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={menuOpen}
          className="rounded-full text-muted-foreground hover:bg-brand-soft hover:text-brand"
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </Button>

        {menuOpen && (
          <nav
            className="absolute inset-x-0 top-14 z-30 border-b bg-background p-2 shadow-lg"
            aria-label="주요 메뉴"
          >
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 font-nanum-neo text-sm text-muted-foreground transition-colors hover:bg-brand-soft hover:text-brand"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>

      <section className="relative overflow-hidden bg-brand px-5 pb-5 pt-6 text-brand-foreground">
        <div className="absolute -right-8 -top-10 size-32 rounded-full bg-white/8" />
        <div className="absolute -right-2 top-12 size-16 rounded-full border border-white/10" />

        <div className="relative">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-[0.14em] text-brand-foreground/70">
            <Sparkles className="size-3.5" aria-hidden="true" />
            CAFE FINDER
          </div>
          <h1 className="font-nanum-neo text-xl leading-snug">
            오늘은 어떤 카페를
            <br />
            찾고 계세요?
          </h1>
          <p className="mt-2 font-anyvid text-xs text-brand-foreground/70">
            취향을 고르면 지도에서 꼭 맞는 공간을 찾아드려요.
          </p>

          <label className="mt-5 flex h-11 items-center gap-2.5 rounded-xl bg-white px-3.5 text-foreground shadow-[0_8px_24px_rgb(52_35_25/0.16)] focus-within:ring-2 focus-within:ring-brand-foreground/40">
            <Search className="size-4 text-brand" aria-hidden="true" />
            <span className="sr-only">카페 검색</span>
            <input
              value={filters.query}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, query: event.target.value }))
              }
              placeholder="카페 이름이나 지역을 검색해보세요"
              className="w-full bg-transparent font-anyvid text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>
        </div>
      </section>

      <section className="border-b bg-background px-5 py-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MapPin className="size-4 text-brand" aria-hidden="true" />
            <h2 className="font-nanum-neo text-sm">어디로 갈까요?</h2>
          </div>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1 font-anyvid text-xs text-muted-foreground hover:text-brand"
            >
              <RotateCcw className="size-3" aria-hidden="true" />
              초기화
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Chip
            label="전체"
            active={filters.region === "all"}
            onClick={() => setFilters((prev) => ({ ...prev, region: "all" }))}
          />
          {availableRegions.map((region) => (
            <Chip
              key={region.value}
              label={region.label}
              active={filters.region === region.value}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  region: prev.region === region.value ? "all" : region.value,
                }))
              }
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setFiltersOpen((value) => !value)}
          aria-expanded={filtersOpen}
          className="mt-3 flex w-full items-center justify-between rounded-xl bg-brand-soft px-3.5 py-3 text-left transition-colors hover:bg-brand-soft/70"
        >
          <span className="flex items-center gap-2 font-nanum-neo text-xs text-brand">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            상세 필터
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-brand px-1.5 py-0.5 font-anyvid text-xs text-brand-foreground">
                {activeFilterCount}
              </span>
            )}
          </span>
          <ChevronDown
            className={cn(
              "size-4 text-brand transition-transform",
              filtersOpen && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>

        {filtersOpen && (
          <div className="mt-4 flex flex-col gap-4 rounded-xl border bg-card p-4">
            <FilterGroup title="뷰 타입">
              {VIEW_TYPES.map((type) => (
                <Chip
                  key={type}
                  label={type}
                  active={filters.viewTypes.includes(type)}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      viewTypes: toggleInArray(prev.viewTypes, type),
                    }))
                  }
                />
              ))}
            </FilterGroup>

            <FilterGroup title="동반 조건">
              {KIDS_POLICIES.map((policy) => (
                <Chip
                  key={policy.value}
                  label={policy.label}
                  active={filters.kidsPolicy === policy.value}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      kidsPolicy: policy.value,
                    }))
                  }
                />
              ))}
              {PET_FRIENDLY_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  active={filters.petFriendly.includes(option.value)}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      petFriendly: toggleInArray(
                        prev.petFriendly,
                        option.value,
                      ),
                    }))
                  }
                />
              ))}
            </FilterGroup>

            <FilterGroup title="규모·편의">
              {SEAT_SIZES.map((size) => (
                <Chip
                  key={size.value}
                  label={size.label}
                  active={filters.seatSize === size.value}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, seatSize: size.value }))
                  }
                />
              ))}
              {AMENITIES.map((amenity) => (
                <Chip
                  key={amenity.value}
                  label={amenity.label}
                  active={filters.amenities.includes(amenity.value)}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      amenities: toggleInArray(prev.amenities, amenity.value),
                    }))
                  }
                />
              ))}
            </FilterGroup>

            <FilterGroup title="방문 팁">
              {VISIT_TIPS.map((tip) => (
                <Chip
                  key={tip.value}
                  label={tip.label}
                  active={filters.visitTips.includes(tip.value)}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      visitTips: toggleInArray(prev.visitTips, tip.value),
                    }))
                  }
                />
              ))}
            </FilterGroup>
          </div>
        )}
      </section>

      <section className="px-4 py-5">
        <div className="mb-3 flex items-end justify-between px-1">
          <div>
            <p className="font-anyvid text-xs text-brand">
              CURATED FOR YOU
            </p>
            <h2 className="mt-0.5 font-nanum-neo text-base">
              지금 가기 좋은 카페
            </h2>
          </div>
          <span className="font-anyvid text-xs text-muted-foreground">
            {results.length}곳
          </span>
        </div>

        {results.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {results.map((cafe, index) => (
              <SideCafeCard
                key={cafe.id}
                cafe={cafe}
                index={index}
                selected={cafe.id === selectedCafeId}
                onSelect={() => {
                  setSelectedCafeId(cafe.id);
                  onCafeSelect?.(cafe);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed bg-background px-4 py-8 text-center">
            <Search className="mx-auto mb-2 size-5 text-muted-foreground" />
            <p className="font-nanum-neo text-sm">조건에 맞는 카페가 없어요</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-2 font-anyvid text-xs text-brand hover:underline"
            >
              필터 초기화하기
            </button>
          </div>
        )}
      </section>

      <section className="border-t bg-background px-5 py-5">
        <div className="mb-3 flex items-center gap-1.5">
          <Sparkles className="size-4 text-brand" aria-hidden="true" />
          <h2 className="font-nanum-neo text-sm">테마로 발견하기</h2>
        </div>
        <div className="grid gap-2">
          {THEME_COLLECTIONS.slice(0, 3).map((theme, index) => (
            <Link
              key={theme.id}
              href="#"
              className="group flex items-center justify-between rounded-xl border bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg font-paperlogy text-xs",
                    index === 0 && "bg-brand-soft text-brand",
                    index === 1 && "bg-cafe-green/10 text-cafe-green",
                    index === 2 && "bg-amber-100 text-amber-700",
                  )}
                >
                  0{index + 1}
                </span>
                <div>
                  <p className="font-nanum-neo text-xs">{theme.title}</p>
                  <p className="mt-0.5 font-anyvid text-xs text-muted-foreground">
                    {theme.count}개의 공간
                  </p>
                </div>
              </div>
              <span className="text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand">
                →
              </span>
            </Link>
          ))}
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="mt-4 w-full border-brand/20 text-brand hover:bg-brand-soft hover:text-brand"
        >
          <Link href="#">내가 아는 카페 제보하기</Link>
        </Button>
      </section>
    </div>
  );

  return (
    <>
      <aside className="hidden w-100 shrink-0 overflow-y-auto border-r bg-sidebar md:block">
        {content}
      </aside>

      {expanded && (
        <div
          className="fixed inset-0 z-10 bg-black/35 backdrop-blur-[2px] md:hidden"
          onClick={() => setExpanded(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-20 flex flex-col overflow-hidden rounded-t-3xl border-t bg-sidebar shadow-[0_-12px_40px_rgb(38_26_20/0.16)] transition-[height] duration-300 md:hidden",
          expanded ? "h-[82vh] max-h-[calc(100dvh-4rem)]" : "h-[104px]",
        )}
      >
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="flex shrink-0 flex-col items-center gap-2 bg-background py-2.5"
        >
          <span className="h-1 w-10 rounded-full bg-brand/25" />
          <span className="flex items-center gap-1.5 font-nanum-neo text-sm">
            내 취향 카페 · {results.length}곳
            <ChevronUp
              className={cn(
                "size-4 text-brand transition-transform",
                expanded && "rotate-180",
              )}
            />
          </span>
        </button>
        <div className="flex-1 overflow-y-auto">{content}</div>
      </div>

      {selectedCafe && (
        <SideDetailPanel
          key={selectedCafe.id}
          cafe={selectedCafe}
          onClose={() => setSelectedCafeId(null)}
        />
      )}
    </>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 font-nanum-neo text-xs transition-all",
        active
          ? "border-brand bg-brand text-brand-foreground shadow-sm"
          : "border-border bg-background text-muted-foreground hover:border-brand/30 hover:bg-brand-soft hover:text-brand",
      )}
    >
      {label}
    </button>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-nanum-neo text-xs text-foreground">{title}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
