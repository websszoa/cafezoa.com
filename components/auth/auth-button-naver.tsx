"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function NaverLoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);

    const supabase = createClient();
    // 네이버는 Supabase 기본 제공 프로바이더가 아니라, Supabase 대시보드에
    // "naver"라는 이름의 Custom OIDC 프로바이더로 등록돼 있어야 동작한다.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "custom:naver",
      options: {
        redirectTo: `${window.location.origin}/auth/callback/naver`,
      },
    });

    // 성공하면 즉시 네이버 로그인 페이지로 이동하므로, 아래는
    // 리다이렉트 자체가 실패했을 때만(네트워크 오류 등) 실행된다.
    if (error) {
      setIsLoading(false);
      console.error("signInWithOAuth failed", error);
    }
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
