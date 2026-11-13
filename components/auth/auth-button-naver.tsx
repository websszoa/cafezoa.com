"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function NaverLoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  // Supabase에 네이버 공급자가 없어 서버 경로(/auth/naver)에서 직접 처리한다. (lib/auth/naver.ts)
  function handleClick() {
    setIsLoading(true);
    // 서버 경로(Route Handler)라 클라이언트 이동이 아닌 전체 페이지 이동으로 연다.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- Route Handler라 전체 페이지 이동이 필요하다.
    window.location.assign(`${window.location.origin}/auth/naver?next=/`);
  }

  return (
    <Button
      variant="sprout"
      size="icon"
      aria-label="네이버 로그인"
      disabled={isLoading}
      onClick={handleClick}
      className="size-12 bg-[#44ba5b] p-0 text-white shadow-[3px_4px_0_var(--color-bark)] hover:bg-[#3a9e4d]"
    >
      <svg aria-hidden="true" viewBox="-3 -3 30 30" className="size-5">
        <path
          fill="currentColor"
          d="M16.273 12.845 7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845Z"
        />
      </svg>
      <span className="sr-only">네이버 로그인</span>
    </Button>
  );
}
