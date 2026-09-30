"use client";

import { useState } from "react";

import NaverMap from "@/components/map/naver-map";
import SidePanel from "@/components/panel/side-panel";
import type { Cafe } from "@/lib/cafes";

export default function HomePage() {
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);

  return (
    <main className="relative flex h-dvh w-full overflow-hidden">
      <SidePanel onCafeSelect={setSelectedCafe} />
      <div className="h-full min-w-0 flex-1">
        <NaverMap selectedCafe={selectedCafe} />
      </div>
    </main>
  );
}
