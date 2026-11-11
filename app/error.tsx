"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Home, RotateCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-dvh place-items-center bg-cream px-5 text-center text-[#191919]">
      <div>
        <div className="mx-auto grid size-20 place-items-center rounded-full border-2 border-bark bg-white text-autumn shadow-[2px_2px_0_var(--color-bark)]">
          <TriangleAlert className="size-9" />
        </div>

        <h1 className="font-paperlogy mt-4 text-[clamp(1.75rem,5vw,2.75rem)] font-semibold text-bark">
          문제가 발생했어요!
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#795f55] sm:text-base">
          페이지를 불러오는 중 오류가 발생했어요.
          <br />
          잠시 후 다시 시도해 주세요.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="sprout"
            className="bg-leaf text-bark hover:bg-leaf-dark"
            onClick={() => retry()}
          >
            <RotateCw className="size-4" />
            다시 시도
          </Button>
          <Button
            render={<Link href="/" />}
            nativeButton={false}
            variant="sprout"
            className="bg-autumn text-white hover:bg-autumn-dark"
          >
            <Home className="size-4" />
            홈으로 이동
          </Button>
        </div>
      </div>
    </main>
  );
}
