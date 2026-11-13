import "server-only";

import type { NextRequest } from "next/server";
import { isIP } from "node:net";
import { createAdminClient } from "@/lib/supabase/admin";

// 로그인할 때 요청 헤더에서 접속 정보를 뽑아 profile_info에 한 줄 기록한다.
// (sql/supabase-profile-info.sql: 클라이언트 값은 신뢰하지 않고 서버가 service_role로만 기록)
//
// 위치(국가·지역·도시·위도·경도)는 배포처인 Vercel이 넣어 주는 헤더에서 읽는다.
// 로컬 개발(next dev)에서는 이 헤더가 없어서 위치 값은 비어 있다.

// 헤더 값 하나를 꺼낸다. Vercel의 도시 이름 등은 URL 인코딩돼 있어 디코딩한다.
function header(request: NextRequest, name: string) {
  const value = request.headers.get(name);
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// 접속 IP. 프록시를 거친 경우 x-forwarded-for의 첫 번째 값이 실제 접속 IP다.
function getIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0];
  const ip = (forwarded ?? request.headers.get("x-real-ip") ?? "").trim();
  // DB의 inet 형식에 맞지 않는 값은 저장하지 않는다.
  return isIP(ip) ? ip : null;
}

// 위도·경도 문자열을 숫자로 바꾼다. 범위를 벗어나면 저장하지 않는다.
function getCoordinate(value: string | null, limit: number) {
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) && Math.abs(number) <= limit ? number : null;
}

// User-Agent에서 브라우저·운영체제·기기 종류를 간단히 구분한다. (외부 라이브러리 없이)
function parseUserAgent(userAgent: string) {
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /SamsungBrowser\//.test(userAgent)
      ? "Samsung Internet"
      : /Whale\//.test(userAgent)
        ? "Whale"
        : /KAKAOTALK/i.test(userAgent)
          ? "KakaoTalk"
          : /NAVER/.test(userAgent)
            ? "Naver"
            : /Firefox\//.test(userAgent)
              ? "Firefox"
              : /Chrome\//.test(userAgent)
                ? "Chrome"
                : /Safari\//.test(userAgent)
                  ? "Safari"
                  : null;

  const operatingSystem = /iPhone|iPad|iPod/.test(userAgent)
    ? "iOS"
    : /Android/.test(userAgent)
      ? "Android"
      : /Windows/.test(userAgent)
        ? "Windows"
        : /Mac OS X/.test(userAgent)
          ? "macOS"
          : /Linux/.test(userAgent)
            ? "Linux"
            : null;

  const deviceType = /iPad|Tablet/.test(userAgent)
    ? "tablet"
    : /Mobi|iPhone|Android/.test(userAgent)
      ? "mobile"
      : userAgent
        ? "desktop"
        : null;

  return { browser, operatingSystem, deviceType };
}

export async function recordLoginInfo(request: NextRequest, userId: string) {
  const userAgent = request.headers.get("user-agent") ?? "";
  const { browser, operatingSystem, deviceType } = parseUserAgent(userAgent);

  const { error } = await createAdminClient()
    .from("profile_info")
    .insert({
      user_id: userId,
      ip: getIp(request),
      country: header(request, "x-vercel-ip-country"),
      region: header(request, "x-vercel-ip-country-region"),
      city: header(request, "x-vercel-ip-city"),
      latitude: getCoordinate(header(request, "x-vercel-ip-latitude"), 90),
      longitude: getCoordinate(header(request, "x-vercel-ip-longitude"), 180),
      browser,
      operating_system: operatingSystem,
      device_type: deviceType,
      referer: request.headers.get("referer"),
    });

  // 접속 기록 실패가 로그인 자체를 막지 않도록 오류는 기록만 한다.
  if (error) console.error("profile_info insert failed", error);
}
