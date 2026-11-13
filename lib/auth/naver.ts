import "server-only";

import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import {
  finishSignIn,
  getSafeRedirectPath,
  redirectLoginExists,
  redirectLoginFailed,
} from "@/lib/auth/oauth-callback";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// =============================================================================
// 네이버 로그인
//
// Supabase에는 네이버 공급자가 없어서, 네이버와 주고받는 부분은 서버에서 직접 처리하고
// 로그인 세션만 Supabase로 만든다.
//
//   1. /auth/naver            → 네이버 로그인 화면으로 보낸다. (startNaverLogin)
//   2. 네이버 로그인
//   3. /auth/callback/naver   → 네이버에서 사용자 정보를 받아 Supabase 사용자 생성(처음이면)
//                               + 로그인 세션 발급 → 원래 페이지로 (handleNaverCallback)
//
// 필요한 설정
//   - .env.local: NAVER_CLIENT_ID, NAVER_CLIENT_SECRET (네이버 개발자센터 > 내 애플리케이션)
//   - 네이버 개발자센터 Callback URL: https://cafezoa.com/auth/callback/naver,
//     http://localhost:3000/auth/callback/naver
//   - 네이버 제공 정보: 이메일(필수), 이름 또는 별명, 프로필 사진
// =============================================================================

// 로그인 요청 위조(CSRF)를 막는 state 값과, 로그인 후 돌아갈 주소를 잠시 담아 두는 쿠키.
const STATE_COOKIE = "naver_oauth_state";
const NEXT_COOKIE = "naver_oauth_next";
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 10, // 10분
};

function getCallbackUrl(origin: string) {
  return `${origin}/auth/callback/naver`;
}

// 네이버 사용자 정보 응답 (https://openapi.naver.com/v1/nid/me)
type NaverProfile = {
  id: string;
  email?: string;
  name?: string;
  nickname?: string;
  profile_image?: string;
};

// 1. 네이버 로그인 화면으로 보낸다.
export function startNaverLogin(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  const redirectPath = getSafeRedirectPath(searchParams.get("next"));
  const clientId = process.env.NAVER_CLIENT_ID;

  if (!clientId) {
    console.error(
      "NAVER_CLIENT_ID가 없어 네이버 로그인을 시작하지 못했습니다.",
    );
    return redirectLoginFailed(redirectPath, origin);
  }

  const state = randomBytes(16).toString("hex");
  const authorizeUrl = new URL("https://nid.naver.com/oauth2.0/authorize");
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", getCallbackUrl(origin));
  authorizeUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(STATE_COOKIE, state, COOKIE_OPTIONS);
  response.cookies.set(NEXT_COOKIE, redirectPath, COOKIE_OPTIONS);
  return response;
}

// 네이버에서 받은 code로 접근 토큰을 받고, 그 토큰으로 사용자 정보를 가져온다.
async function getNaverProfile(code: string, state: string) {
  const tokenUrl = new URL("https://nid.naver.com/oauth2.0/token");
  tokenUrl.searchParams.set("grant_type", "authorization_code");
  tokenUrl.searchParams.set("client_id", process.env.NAVER_CLIENT_ID ?? "");
  tokenUrl.searchParams.set(
    "client_secret",
    process.env.NAVER_CLIENT_SECRET ?? "",
  );
  tokenUrl.searchParams.set("code", code);
  tokenUrl.searchParams.set("state", state);

  const tokenResponse = await fetch(tokenUrl, { method: "POST" });
  const token = (await tokenResponse.json()) as {
    access_token?: string;
    error_description?: string;
  };
  if (!token.access_token) {
    throw new Error(`네이버 토큰 발급 실패: ${token.error_description}`);
  }

  const profileResponse = await fetch("https://openapi.naver.com/v1/nid/me", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  const profile = (await profileResponse.json()) as {
    resultcode: string;
    response?: NaverProfile;
  };
  if (profile.resultcode !== "00" || !profile.response) {
    throw new Error("네이버 사용자 정보 조회 실패");
  }
  return profile.response;
}

// 3. 네이버 로그인이 끝나고 돌아오는 주소의 처리.
export async function handleNaverCallback(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  const redirectPath = getSafeRedirectPath(
    request.cookies.get(NEXT_COOKIE)?.value,
  );
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const savedState = request.cookies.get(STATE_COOKIE)?.value;

  // 한 번 쓴 state·돌아갈 주소 쿠키는 결과와 상관없이 지운다.
  function withClearedCookies(response: NextResponse) {
    response.cookies.delete(STATE_COOKIE);
    response.cookies.delete(NEXT_COOKIE);
    return response;
  }

  // 사용자가 동의를 취소했거나, state가 다르면(위조 의심) 실패로 처리한다.
  if (!code || !state || !savedState || state !== savedState) {
    return withClearedCookies(redirectLoginFailed(redirectPath, origin));
  }

  try {
    const naver = await getNaverProfile(code, state);
    if (!naver.email) {
      throw new Error(
        "네이버에서 이메일을 받지 못했습니다. (제공 정보 동의 필요)",
      );
    }

    const admin = createAdminClient();
    // 네이버는 별명이 없는 사용자의 nickname을 "abc****"처럼 가린 아이디로 준다.
    // 그래서 이름(name) → 가려지지 않은 별명 → 이메일 앞부분 순서로 고른다.
    const isMasked = (value?: string) => !value || value.includes("*");
    const name = !isMasked(naver.name)
      ? naver.name!
      : !isMasked(naver.nickname)
        ? naver.nickname!
        : naver.email.split("@")[0];

    // 같은 이메일로 이미 다른 소셜 로그인(구글·카카오)으로 가입했다면 로그인하지 않고,
    // 처음 가입한 방법으로 로그인하라고 안내한다.
    // (예전 네이버 가입자는 auth_provider가 "email"로 남아 있을 수 있어 네이버로 본다)
    const { data: existing } = await admin
      .from("profiles")
      .select("auth_provider")
      .ilike("email", naver.email.replace(/[\\%_]/g, "\\$&"))
      .maybeSingle();
    if (
      existing &&
      existing.auth_provider !== "naver" &&
      existing.auth_provider !== "email"
    ) {
      return withClearedCookies(
        redirectLoginExists(redirectPath, origin, existing.auth_provider),
      );
    }

    // 처음 로그인한 네이버 사용자는 Supabase 사용자를 만든다.
    const { error: createError } = await admin.auth.admin.createUser({
      email: naver.email,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        name,
        avatar_url: naver.profile_image,
        naver_id: naver.id,
      },
      app_metadata: { provider: "naver", providers: ["naver"] },
    });
    if (createError && createError.code !== "email_exists") {
      throw createError;
    }

    // 메일을 보내지 않는 일회용 로그인 토큰을 만들어, 바로 로그인 세션(쿠키)으로 바꾼다.
    const { data: link, error: linkError } =
      await admin.auth.admin.generateLink({
        type: "magiclink",
        email: naver.email,
      });
    if (linkError) throw linkError;

    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      type: "magiclink",
      token_hash: link.properties.hashed_token,
    });
    if (error || !data.user) throw error ?? new Error("세션 발급 실패");

    // 이메일 토큰으로 로그인하면 Supabase가 가입 방식을 "email"로 바꾸므로, 다시 "naver"로 맞춘다.
    // (이 변경이 트리거를 거쳐 profiles.auth_provider에도 "naver"로 반영된다)
    const { data: updated, error: updateError } =
      await admin.auth.admin.updateUserById(data.user.id, {
        app_metadata: { provider: "naver", providers: ["naver"] },
        // 로그인할 때마다 이름·사진을 네이버 최신 값으로 맞춘다. (예전에 별표로 저장된 이름도 고쳐진다)
        user_metadata: {
          full_name: name,
          name,
          avatar_url: naver.profile_image,
          naver_id: naver.id,
        },
      });
    if (updateError) console.error("naver provider update failed", updateError);

    return withClearedCookies(
      await finishSignIn({
        request,
        supabase,
        user: updated?.user ?? data.user,
        redirectPath,
      }),
    );
  } catch (error) {
    console.error("naver login failed", error);
    return withClearedCookies(redirectLoginFailed(redirectPath, origin));
  }
}
