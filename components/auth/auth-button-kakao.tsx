"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function KakaoLoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback/kakao`,
      },
    });

    // 성공하면 즉시 카카오 로그인 페이지로 이동하므로, 아래는
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
      aria-label="카카오 로그인"
      disabled={isLoading}
      onClick={handleClick}
      className="size-12 bg-[#fee500] p-0 text-bark shadow-[3px_4px_0_var(--color-bark)] hover:bg-[#f4dc00]"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
        <path
          fill="currentColor"
          d="M12 3C6.48 3 2 6.5 2 10.82c0 2.76 1.83 5.18 4.59 6.57l-.93 3.42a.38.38 0 0 0 .58.42l4.08-2.7c.55.07 1.11.11 1.68.11 5.52 0 10-3.5 10-7.82S17.52 3 12 3Z"
        />
      </svg>
      <span className="sr-only">카카오 로그인</span>
    </Button>
  );
}
