import { Star } from "lucide-react";
import type { Place } from "@/lib/places";

export default function PlaceCard({ place }: { place: Place }) {
  return (
    <div className="flex gap-3 px-4 py-3 border-b hover:bg-muted/50 cursor-pointer transition-colors">
      {/* 썸네일 */}
      <div className="w-20 h-20 shrink-0 rounded-lg bg-muted overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
          <span className="text-2xl text-muted-foreground/40">📍</span>
        </div>
      </div>

      {/* 정보 */}
      <div className="flex flex-col justify-center gap-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-anyvid text-sm truncate">{place.name}</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-anyvid text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <Star className="size-3 fill-yellow-400 text-yellow-400" />
            <span className="text-foreground">{place.rating}</span>
          </span>
          <span>리뷰 {place.reviewCount.toLocaleString()}</span>
          {place.avgPrice && (
            <>
              <span>·</span>
              <span>평균 {place.avgPrice}</span>
            </>
          )}
        </div>
        <p className="text-[12px] font-anyvid text-muted-foreground truncate">
          {place.address}
        </p>
      </div>
    </div>
  );
}
