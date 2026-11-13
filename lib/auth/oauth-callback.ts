import "server-only";

import { after, NextResponse, type NextRequest } from "next/server";
import { recordLoginInfo } from "@/lib/auth/login-info";
import { sendMemberJoinEmails } from "@/lib/email/send-member-email";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// 계정 생성 시각과 마지막 로그인 시각이 거의 같으면(10초 이내) 이번이 첫 로그인, 즉 가입이다.
function isFirstSignIn(createdAt: string, lastSignInAt: string | undefined) {
  if (!lastSignInAt) return true;
  return (
    Math.abs(new Date(lastSignInAt).getTime() - new Date(createdAt).getTime()) <
    10_000
  );
}

// 다른 사이트로 보내지 않도록 같은 사이트 경로("/..."로 시작, "//" 제외)만 허용한다.
export function getSafeRedirectPath(next: string | null | undefined) {
  return next?.startsWith("/") && !next.startsWith("//") ? next : "/";
}

// 로그인 실패 표시(?login=failed)와 함께 원래 페이지로 돌려보낸다.
export function redirectLoginFailed(redirectPath: string, origin: string) {
  const failedUrl = new URL(redirectPath, origin);
  failedUrl.searchParams.set("login", "failed");
  return NextResponse.redirect(failedUrl);
}

// 소셜 로그인 공급자. (profiles.auth_provider 값과 같다)
export type SocialProvider = "google" | "kakao" | "naver";

// 이미 다른 소셜 로그인으로 가입한 이메일이면, 그 로그인 방법으로 안내하도록
// ?login=exists&provider=(가입한 공급자)를 붙여 원래 페이지로 돌려보낸다. (components/auth/auth-login-toast.tsx)
export function redirectLoginExists(
  redirectPath: string,
  origin: string,
  joinedProvider: string,
) {
  const url = new URL(redirectPath, origin);
  url.searchParams.set("login", "exists");
  url.searchParams.set("provider", joinedProvider);
  return NextResponse.redirect(url);
}

// 로그인 세션을 만든 뒤 공통으로 하는 처리. (구글·카카오·네이버 공용)
// 접속 기록, 방문 횟수, 첫 가입 축하(+가입 메일) 또는 로그인 알림 표시를 하고 원래 페이지로 보낸다.
export async function finishSignIn({
  request,
  supabase,
  user,
  redirectPath,
}: {
  request: NextRequest;
  supabase: SupabaseClient;
  user: User;
  redirectPath: string;
}) {
  // 로그인 접속 정보(IP·위치·기기·유입 경로)를 profile_info에 남긴다.
  await recordLoginInfo(request, user.id);

  // 로그인할 때마다 방문 횟수를 1 올린다. (첫 로그인이면 1)
  // sql/supabase-function.sql의 record_profile_visit()가 본인 프로필의 visit_count와
  // last_visited_at을 갱신한다. 실패해도 로그인은 계속 진행한다.
  const { error: visitError } = await supabase.rpc("record_profile_visit");
  if (visitError) console.error("record_profile_visit failed", visitError);

  const successUrl = new URL(redirectPath, request.nextUrl.origin);
  // 처음 가입한 사용자는 ?welcome=1을 붙여 화면에서 축하 팝업을 띄운다.
  if (isFirstSignIn(user.created_at, user.last_sign_in_at)) {
    successUrl.searchParams.set("welcome", "1");

    // 가입 메일(사용자 환영 + 관리자 알림)은 응답을 보낸 뒤 발송해 로그인 이동을 늦추지 않는다.
    const metadata = user.user_metadata;
    const email = user.email;
    if (email) {
      after(() =>
        sendMemberJoinEmails({
          name:
            metadata?.full_name ??
            metadata?.name ??
            metadata?.user_name ??
            email.split("@")[0],
          email,
          provider: user.app_metadata?.provider ?? "google",
          joinedAt: user.created_at,
        }),
      );
    }
  } else {
    // 이미 가입한 사용자는 ?login=success를 붙여 화면에서 "로그인되었습니다" 알림을 띄운다.
    successUrl.searchParams.set("login", "success");
  }
  return NextResponse.redirect(successUrl);
}

// 소셜 로그인(Supabase OAuth: 구글·카카오)이 끝나고 돌아오는 주소의 처리.
// (app/auth/callback/google/route.ts, app/auth/callback/kakao/route.ts)
// 공급자에서 받은 code를 로그인 세션(쿠키)으로 바꾼 뒤, 로그인을 시작한 페이지로 돌려보낸다.
// Supabase 대시보드 > Authentication > URL Configuration > Redirect URLs에 각 콜백 주소가 등록돼 있어야 한다.
export async function handleOAuthCallback(
  request: NextRequest,
  provider: Exclude<SocialProvider, "naver">,
) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const redirectPath = getSafeRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      // 같은 이메일로 이미 다른 소셜 로그인으로 가입한 경우:
      // Supabase가 같은 이메일 계정을 자동으로 이어 주지만, 처음 가입한 방법으로만 로그인하도록
      // 방금 만든 세션을 로그아웃하고 "○○로 가입된 이메일" 안내로 돌려보낸다.
      // (app_metadata.provider는 처음 가입한 공급자로 유지된다)
      const joinedProvider = data.user.app_metadata?.provider;
      if (joinedProvider && joinedProvider !== provider) {
        await supabase.auth.signOut();
        return redirectLoginExists(redirectPath, origin, joinedProvider);
      }

      return finishSignIn({ request, supabase, user: data.user, redirectPath });
    }
  }

  // code가 없거나 세션 교환에 실패한 경우
  return redirectLoginFailed(redirectPath, origin);
}
