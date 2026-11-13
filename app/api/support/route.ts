import { after, NextResponse, type NextRequest } from "next/server";
import { sendSupportEmails } from "@/lib/email/send-support-email";
import { createClient } from "@/lib/supabase/server";
import { supportTypes } from "@/lib/support";
import { supportFormSchema } from "@/lib/validations";

// 고객지원 문의 접수 (components/page/page-support.tsx → POST /api/support)
// 1. 문의 유형과 입력값을 화면과 같은 규칙(lib/validations.ts)으로 다시 검사한다.
// 2. support_requests 테이블(sql/supabase-support.sql)에 저장한다.
//    요청한 사람의 권한(비로그인 anon / 로그인 authenticated)으로 저장해 RLS 정책을 그대로 따른다.
// 3. 응답을 보낸 뒤 접수 확인 메일(작성자) + 접수 알림 메일(관리자)을 보낸다.
//
// 응답: 200 { ok: true } / 400 입력 오류 / 500 저장 실패
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const type = body?.type;
  const parsed = supportFormSchema.safeParse(body);

  // 접수 가능한 유형만 받는다. (default는 안내용이라 제외)
  if (
    !parsed.success ||
    typeof type !== "string" ||
    type === "default" ||
    !(type in supportTypes)
  ) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const values = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 비로그인 방문자는 조회 권한이 없으므로 저장 후 결과를 다시 읽지 않는다.
  const { error } = await supabase.from("support_requests").insert({
    type,
    user_id: user?.id ?? null,
    name: values.name,
    email: values.email.trim(),
    subject: values.subject,
    related_url: values.relatedUrl || null,
    content: values.content,
    privacy_consent: values.privacyConsent,
  });

  if (error) {
    console.error("support_requests insert failed", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }

  after(() =>
    sendSupportEmails({
      typeLabel: supportTypes[type as keyof typeof supportTypes].title,
      name: values.name,
      email: values.email.trim(),
      subject: values.subject,
      content: values.content,
      relatedUrl: values.relatedUrl || null,
      submittedAt: new Date().toISOString(),
    }),
  );

  return NextResponse.json({ ok: true });
}
