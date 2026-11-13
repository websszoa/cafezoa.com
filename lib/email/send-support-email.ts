import "server-only";

import { Resend } from "resend";
import { ADMIN_EMAIL, EMAIL_FROM } from "@/lib/constants";
import { supportAdminEmail } from "@/lib/email/templates/support-admin-email";
import { supportReceiptEmail } from "@/lib/email/templates/support-receipt-email";

// 고객지원 문의가 접수되면 작성자에게 접수 확인 메일을, 관리자에게 접수 알림 메일을 보낸다.
// (lib/email/templates/support-receipt-email.ts, support-admin-email.ts)
// 메일 발송 실패가 문의 접수를 막지 않도록 오류는 기록만 한다.
export async function sendSupportEmails({
  typeLabel,
  name,
  email,
  subject,
  content,
  relatedUrl,
  submittedAt,
}: {
  typeLabel: string;
  name: string;
  email: string;
  subject: string;
  content: string;
  relatedUrl: string | null;
  submittedAt: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY가 없어 문의 메일을 보내지 못했습니다.");
    return;
  }

  const resend = new Resend(apiKey);
  const submittedAtLabel = new Date(submittedAt).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
  });

  const results = await Promise.allSettled([
    resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: `[카페조아] ${typeLabel} 접수 안내: ${subject}`,
      html: supportReceiptEmail({
        name,
        type: typeLabel,
        title: subject,
        submittedAt: submittedAtLabel,
      }),
    }),
    resend.emails.send({
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,
      // 관리자가 메일에서 바로 답장하면 작성자에게 가도록 한다.
      replyTo: email,
      subject: `[카페조아] 새 ${typeLabel}: ${subject}`,
      html: supportAdminEmail({
        type: typeLabel,
        name,
        email,
        title: subject,
        // 관련 주소는 별도 칸이 없어 내용 아래에 붙인다.
        content: relatedUrl
          ? `${content}\n\n관련 주소: ${relatedUrl}`
          : content,
        submittedAt: submittedAtLabel,
      }),
    }),
  ]);

  // Resend는 실패해도 예외 대신 { error }를 돌려주므로 두 경우를 모두 확인한다.
  results.forEach((result, index) => {
    const target = index === 0 ? "문의 접수 확인 메일" : "관리자 알림 메일";
    if (result.status === "rejected") {
      console.error(`${target} 발송 실패`, result.reason);
    } else if (result.value.error) {
      console.error(`${target} 발송 실패`, result.value.error);
    }
  });
}
