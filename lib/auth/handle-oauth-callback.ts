import { NextResponse, after, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendNewSignupNotification } from "@/lib/email/signup-notification";
import { sendWelcomeUserEmail } from "@/lib/email/welcome-user";

// OAuth 응답에는 "신규 가입 여부" 플래그가 없다.
// created_at과 last_sign_in_at이 이 간격(ms) 이내로 붙어 있으면 신규 가입으로 추정한다.
const NEW_USER_THRESHOLD_MS = 5_000;

function redirectWithError(origin: string, reason: string) {
  return NextResponse.redirect(`${origin}/?authError=${reason}`);
}

// 별도 UA 파싱 라이브러리 없이 필요한 최소 정보만 추출한다.
function parseUserAgent(userAgent: string | null) {
  if (!userAgent) {
    return { browser: null, operatingSystem: null, deviceType: null };
  }

  let operatingSystem: string | null = null;
  if (/windows nt/i.test(userAgent)) operatingSystem = "Windows";
  else if (/mac os x/i.test(userAgent)) operatingSystem = "macOS";
  else if (/android/i.test(userAgent)) operatingSystem = "Android";
  else if (/iphone|ipad|ipod/i.test(userAgent)) operatingSystem = "iOS";
  else if (/linux/i.test(userAgent)) operatingSystem = "Linux";

  let browser: string | null = null;
  if (/edg\//i.test(userAgent)) browser = "Edge";
  else if (/crios\//i.test(userAgent)) browser = "Chrome";
  else if (/chrome\//i.test(userAgent)) browser = "Chrome";
  else if (/firefox\//i.test(userAgent)) browser = "Firefox";
  else if (/safari\//i.test(userAgent)) browser = "Safari";

  const deviceType = /mobile/i.test(userAgent)
    ? "mobile"
    : /tablet|ipad/i.test(userAgent)
      ? "tablet"
      : "desktop";

  return { browser, operatingSystem, deviceType };
}

// 구글/카카오 등 OAuth 제공자의 콜백 라우트가 공통으로 쓰는 처리 로직.
// 각 provider 폴더의 route.ts는 providerLabel만 다르게 넘기는 얇은 래퍼로 둔다.
export async function handleOAuthCallback(
  request: NextRequest,
  { providerLabel }: { providerLabel: string },
) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return redirectWithError(origin, "missing_code");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return redirectWithError(origin, "exchange_failed");
  }

  const { user } = data;

  // on_auth_user_created/updated 트리거가 이미 profiles 행을 생성/갱신했으므로
  // 교환 직후 바로 조회할 수 있다.
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_withdrawn, email, name")
    .eq("id", user.id)
    .single();

  // 탈퇴한 계정은 로그인 자체를 허용하지 않는다(재로그인으로 자동 복구 금지).
  if (profile?.is_withdrawn) {
    await supabase.auth.signOut();
    return redirectWithError(origin, "withdrawn");
  }

  // 방문 횟수 증가. 실패해도 로그인 자체를 막지는 않는다.
  const { error: visitError } = await supabase.rpc("record_profile_visit");
  if (visitError) {
    console.error("record_profile_visit failed", visitError);
  }

  // created_at과 last_sign_in_at이 거의 같은 시각이면 신규 가입으로 간주한다.
  const createdAt = user.created_at ? new Date(user.created_at).getTime() : null;
  const lastSignInAt = user.last_sign_in_at
    ? new Date(user.last_sign_in_at).getTime()
    : null;
  const isNewUser =
    createdAt !== null &&
    lastSignInAt !== null &&
    lastSignInAt - createdAt < NEW_USER_THRESHOLD_MS;

  if (isNewUser && profile?.email) {
    const email = profile.email;
    const name = profile.name ?? "";
    const signedUpAt = user.created_at;
    // 응답(리다이렉트)을 지연시키지 않도록 메일 발송은 응답 이후로 미룬다.
    after(async () => {
      try {
        await sendWelcomeUserEmail({ email, name, provider: providerLabel });
      } catch (sendError) {
        console.error("sendWelcomeUserEmail failed", sendError);
      }
      try {
        await sendNewSignupNotification({
          email,
          name,
          signedUpAt,
          provider: providerLabel,
        });
      } catch (sendError) {
        console.error("sendNewSignupNotification failed", sendError);
      }
    });
  }

  // IP/위치/기기 정보는 이 요청의 헤더에서만 얻을 수 있어 지금 기록한다.
  // 클라이언트가 조작하지 못하도록 authenticated가 아닌 service_role로만 insert한다.
  const requestHeaders = request.headers;
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    null;
  const latitudeHeader = requestHeaders.get("x-vercel-ip-latitude");
  const longitudeHeader = requestHeaders.get("x-vercel-ip-longitude");
  const { browser, operatingSystem, deviceType } = parseUserAgent(
    requestHeaders.get("user-agent"),
  );

  const admin = createAdminClient();
  const { error: infoError } = await admin.from("profile_info").insert({
    user_id: user.id,
    ip,
    country: requestHeaders.get("x-vercel-ip-country"),
    region: requestHeaders.get("x-vercel-ip-country-region"),
    city: requestHeaders.get("x-vercel-ip-city"),
    latitude: latitudeHeader ? Number(latitudeHeader) : null,
    longitude: longitudeHeader ? Number(longitudeHeader) : null,
    browser,
    operating_system: operatingSystem,
    device_type: deviceType,
    referer: requestHeaders.get("referer"),
  });
  if (infoError) {
    console.error("profile_info insert failed", infoError);
  }

  const redirectUrl = new URL(next, origin);
  redirectUrl.searchParams.set("authSuccess", isNewUser ? "new" : "returning");
  return NextResponse.redirect(redirectUrl);
}
