"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { places, panelLabels } from "@/lib/places";
import PlaceCard from "./place-card";
import { Button } from "@/components/ui/button";

export default function InfoPanel() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const panel = searchParams.get("panel");

  if (!panel || !places[panel]) return null;

  const items = places[panel];
  const label = panelLabels[panel] ?? panel;

  return (
    <aside className="hidden md:flex flex-col w-80 shrink-0 border-r bg-background z-10">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <h2 className="font-nanumNeo text-sm">{label}</h2>
        <Button
          onClick={() => router.push("/")}
          variant="ghost"
          size="icon-sm"
          aria-label="닫기"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* 결과 수 */}
      <div className="px-4 py-2 border-b shrink-0">
        <span className="font-nanumNeo text-xs text-muted-foreground">
          3km 근방에 {items.length}개의 장소가 있습니다.
        </span>
      </div>

      {/* 목록 */}
      <div className="flex-1 overflow-y-auto">
        {items.map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </div>
    </aside>
  );
}
