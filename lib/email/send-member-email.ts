import "server-only";

import { Resend } from "resend";
import { ADMIN_EMAIL, EMAIL_FROM } from "@/lib/constants";
import { providerLabels } from "@/lib/labels";
import { memberAdminEmail } from "@/lib/email/templates/member-admin-email";
import { memberWelcomeEmail } from "@/lib/email/templates/member-welcome-email";

// 처음 회원 가입한 사용자에게 환영 메일을, 관리자에게 신규 가입 알림 메일을 보낸다.
// (lib/email/templates/member-welcome-email.ts, member-admin-email.ts)
// 메일 발송 실패가 가입·로그인을 막지 않도록 오류는 기록만 한다.
export async function sendMemberJoinEmails({
  name,
  email,
  provider,
  joinedAt,
}: {
  name: string;
  email: string;
  provider: string;
  joinedAt: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY가 없어 가입 메일을 보내지 못했습니다.");
    return;
  }

  const resend = new Resend(apiKey);
  const providerLabel = providerLabels[provider] ?? provider;
  const joinedAtLabel = new Date(joinedAt).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
  });

  const results = await Promise.allSettled([
    resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: `${name}님, 카페조아 가입을 환영합니다!`,
      html: memberWelcomeEmail({ name, email, provider: providerLabel }),
    }),
    resend.emails.send({
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,
      subject: `[카페조아] 새로운 회원 가입: ${name}`,
      html: memberAdminEmail({
        name,
        email,
        provider: providerLabel,
        joinedAt: joinedAtLabel,
      }),
    }),
  ]);

  // Resend는 실패해도 예외 대신 { error }를 돌려주므로 두 경우를 모두 확인한다.
  results.forEach((result, index) => {
    const target = index === 0 ? "환영 메일" : "관리자 알림 메일";
    if (result.status === "rejected") {
      console.error(`가입 ${target} 발송 실패`, result.reason);
    } else if (result.value.error) {
      console.error(`가입 ${target} 발송 실패`, result.value.error);
    }
  });
}
