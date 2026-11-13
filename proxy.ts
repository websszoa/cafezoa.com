import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

import cafeDetails from "@/data/cafe-details.json";

// 상세 페이지가 있는 카페 slug 목록.
const cafeSlugs = new Set(Object.keys(cafeDetails));

export function proxy(request: NextRequest) {
  // 없는 카페 상세 주소(/cafe/{slug})는 페이지 렌더링 전에 404로 보낸다.
  // 페이지 안에서 notFound()를 부르면 응답이 이미 시작돼 상태 코드가 200으로 남기 때문이다. (soft 404 방지)
  const match = request.nextUrl.pathname.match(/^\/cafe\/([^/]+)\/?$/);
  if (match && !cafeSlugs.has(decodeURIComponent(match[1]))) {
    return NextResponse.rewrite(new URL("/_cafe-not-found", request.url), {
      status: 404,
    });
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
