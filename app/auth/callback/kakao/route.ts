import type { NextRequest } from "next/server";
import { handleOAuthCallback } from "@/lib/auth/oauth-callback";

// 카카오 로그인이 끝나고 돌아오는 주소. 처리는 lib/auth/oauth-callback.ts에서 한다.
export function GET(request: NextRequest) {
  return handleOAuthCallback(request, "kakao");
}
