"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function GoogleLoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback/google`,
      },
    });

    // 성공하면 즉시 구글 로그인 페이지로 이동하므로, 아래는
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
      aria-label="Google 로그인"
      disabled={isLoading}
      onClick={handleClick}
      className="size-12 bg-white p-0 text-bark shadow-[3px_4px_0_var(--color-bark)] hover:bg-neutral-50"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
        <path
          fill="#4285F4"
          d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z"
        />
        <path
          fill="#34A853"
          d="M12 22c2.7 0 4.98-.9 6.63-2.42l-3.24-2.53c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.61A10 10 0 0 0 12 22Z"
        />
        <path
          fill="#FBBC05"
          d="M6.39 13.88A6 6 0 0 1 6.08 12c0-.65.11-1.29.31-1.88V7.51H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.49l3.35-2.61Z"
        />
        <path
          fill="#EA4335"
          d="M12 5.99c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.96 5.51l3.35 2.61C7.18 7.75 9.39 5.99 12 5.99Z"
        />
      </svg>
      <span className="sr-only">Google 로그인</span>
    </Button>
  );
}
