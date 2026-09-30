import Image from "next/image";
import { cn } from "@/lib/utils";
import { Clock, Coffee, MapPin, Star } from "lucide-react";
import { getRegionLabel } from "@/lib/filters";
import type { Cafe } from "@/lib/cafes";

const accentStyles = [
  "bg-brand-soft text-brand",
  "bg-cafe-green/10 text-cafe-green",
  "bg-amber-100 text-amber-700",
];

export default function SideCafeCard({
  cafe,
  index = 0,
  selected = false,
  onSelect,
}: {
  cafe: Cafe;
  index?: number;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group w-full rounded-2xl border bg-card p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-[0_10px_30px_rgb(63_43_32/0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
        selected && "border-brand/40 bg-brand-soft/30 shadow-sm",
      )}
    >
      <div className="flex gap-3">
        {cafe.images.cover ? (
          <div className="relative size-14 shrink-0 overflow-hidden rounded-xl">
            <Image
              src={cafe.images.cover}
              alt={`${cafe.name} 전경`}
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>
        ) : (
          <div
            className={cn(
              "flex size-14 shrink-0 items-center justify-center rounded-xl",
              accentStyles[index % accentStyles.length],
            )}
          >
            <Coffee className="size-6" aria-hidden="true" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-nanum-neo">{cafe.name}</h3>
            <span className="flex shrink-0 items-center gap-0.5 font-anyvid text-xs font-semibold text-foreground">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              {cafe.rating}
            </span>
          </div>

          <p className="mt-1 flex items-center gap-1 truncate font-anyvid text-sm text-muted-foreground">
            <MapPin className="size-3 shrink-0 text-brand" aria-hidden="true" />
            {cafe.address}
          </p>

          <p className="mt-1.5 line-clamp-2 font-anyvid text-sm leading-relaxed text-muted-foreground">
            {cafe.description}
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-muted px-2 py-0.5 font-anyvid text-xs text-muted-foreground">
              {getRegionLabel(cafe.region)}
            </span>
            {cafe.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-brand-soft px-2 py-0.5 font-anyvid text-xs text-brand"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-dashed pt-2.5 font-anyvid text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="size-3" aria-hidden="true" />
          {cafe.openingHours}
        </span>
        <span>리뷰 {cafe.reviewCount.toLocaleString()}</span>
      </div>
    </button>
  );
}
