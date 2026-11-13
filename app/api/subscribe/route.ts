import { after, NextResponse, type NextRequest } from "next/server";
import { sendNewsletterEmails } from "@/lib/email/send-newsletter-email";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { subscribeFormSchema } from "@/lib/validations";

// 구독 신청 (components/dialog/dialog-subscribe.tsx → POST /api/subscribe)
// 1. 입력값을 화면과 같은 규칙(lib/validations.ts)으로 다시 검사한다.
// 2. subscriptions 테이블(sql/supabase-subscribe.sql)에 저장한다.
//    구독 완료 메일의 "구독 취소" 링크에 쓸 id가 필요해 서버 키로 저장하고 id를 받는다.
// 3. 응답을 보낸 뒤 구독 완료 메일(사용자) + 신규 구독 알림 메일(관리자)을 보낸다.
//
// 응답: 200 { ok: true } / 400 입력 오류 / 409 이미 구독 중인 이메일 / 500 저장 실패
export async function POST(request: NextRequest) {
  const parsed = subscribeFormSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const values = parsed.data;

  // 로그인 상태에서 구독하면 회원과 연결한다.
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();

  const { data, error } = await createAdminClient()
    .from("subscriptions")
    .insert({
      email: values.email.trim(),
      user_id: user?.id ?? null,
      age_group: values.ageGroup,
      source: values.source,
      styles: [...new Set(values.styles)],
      priorities: [...new Set(values.priorities)],
      wish: values.wish || null,
      privacy_consent: values.privacyConsent,
    })
    .select("id, email, created_at")
    .single();

  if (error) {
    // 같은 이메일(대소문자 무시)은 한 번만 구독할 수 있다. (고유 인덱스)
    if (error.code === "23505") {
      return NextResponse.json({ error: "exists" }, { status: 409 });
    }
    console.error("subscriptions insert failed", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }

  after(() =>
    sendNewsletterEmails({
      email: data.email,
      subscribedAt: data.created_at,
      newsletterId: String(data.id),
    }),
  );

  return NextResponse.json({ ok: true });
}
