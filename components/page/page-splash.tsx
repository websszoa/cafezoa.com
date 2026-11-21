"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

// 처음 접속(새로고침 포함)할 때만 보이는 전체 화면 로딩.
// 루트 레이아웃에 있어서 페이지 간 이동(클라이언트 내비게이션) 때는 다시 뜨지 않는다.
const MIN_VISIBLE_MS = 800; // 너무 빨리 깜빡이고 사라지는 것 방지
const MAX_VISIBLE_MS = 4000; // 이미지가 오래 걸려도 이 시간이 지나면 닫는다
const FADE_MS = 400;

export function PageSplash() {
  const [phase, setPhase] = useState<"visible" | "fading" | "done">("visible");

  useEffect(() => {
    const start = performance.now();
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;

    const hide = () => {
      const wait = Math.max(0, MIN_VISIBLE_MS - (performance.now() - start));
      fadeTimer = setTimeout(() => {
        setPhase("fading");
        fadeTimer = setTimeout(() => setPhase("done"), FADE_MS);
      }, wait);
    };

    const maxTimer = setTimeout(hide, MAX_VISIBLE_MS);

    if (document.readyState === "complete") {
      hide();
    } else {
      window.addEventListener("load", hide, { once: true });
    }

    return () => {
      window.removeEventListener("load", hide);
      clearTimeout(maxTimer);
      clearTimeout(fadeTimer);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <>
      {/* 자바스크립트가 꺼진 환경에서는 로딩 화면이 화면을 가리지 않게 숨긴다 */}
      <noscript>
        <style>{`.page-splash{display:none!important}`}</style>
      </noscript>
      <div
        role="status"
        aria-live="polite"
        className={`page-splash bg-background fixed inset-0 z-9999 grid place-items-center transition-opacity duration-400 ${
          phase === "fading" ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <Loader2 aria-hidden className="size-8 animate-spin text-[#22a447]" />
        <span className="sr-only">불러오는 중</span>
      </div>
    </>
  );
}
