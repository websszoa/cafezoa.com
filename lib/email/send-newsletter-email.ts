import "server-only";

import { Resend } from "resend";
import { ADMIN_EMAIL, EMAIL_FROM } from "@/lib/constants";
import { newsletterAdminEmail } from "@/lib/email/templates/newsletter-admin-email";
import { newsletterWelcomeEmail } from "@/lib/email/templates/newsletter-welcome-email";

// 구독 신청을 마친 사용자에게 구독 완료 메일을, 관리자에게 신규 구독 알림 메일을 보낸다.
// (lib/email/templates/newsletter-welcome-email.ts, newsletter-admin-email.ts)
// 메일 발송 실패가 구독 신청을 막지 않도록 오류는 기록만 한다.
export async function sendNewsletterEmails({
  email,
  subscribedAt,
  newsletterId,
}: {
  email: string;
  subscribedAt: string;
  newsletterId: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY가 없어 구독 메일을 보내지 못했습니다.");
    return;
  }

  const resend = new Resend(apiKey);
  const subscribedAtLabel = new Date(subscribedAt).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
  });

  const results = await Promise.allSettled([
    resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "카페조아 소식 구독이 완료됐어요!",
      html: newsletterWelcomeEmail({
        email,
        subscribedAt: subscribedAtLabel,
        newsletterId,
      }),
    }),
    resend.emails.send({
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,
      subject: `[카페조아] 새로운 구독자: ${email}`,
      html: newsletterAdminEmail({ email, subscribedAt: subscribedAtLabel }),
    }),
  ]);

  // Resend는 실패해도 예외 대신 { error }를 돌려주므로 두 경우를 모두 확인한다.
  results.forEach((result, index) => {
    const target = index === 0 ? "구독 완료 메일" : "관리자 알림 메일";
    if (result.status === "rejected") {
      console.error(`${target} 발송 실패`, result.reason);
    } else if (result.value.error) {
      console.error(`${target} 발송 실패`, result.value.error);
    }
  });
}
