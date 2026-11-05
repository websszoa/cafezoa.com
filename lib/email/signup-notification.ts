import "server-only";

import { Resend } from "resend";
import { ADMIN_EMAIL } from "@/lib/constants";
import { memberAdminEmail } from "@/lib/email/templates/member-admin-email";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_ADDRESS = "Cafezoa <no-reply@cafezoa.com>";

export async function sendNewSignupNotification({
  email,
  name,
  signedUpAt,
  provider = "Google",
}: {
  email: string;
  name: string;
  signedUpAt: string;
  provider?: string;
}) {
  const joinedAt = new Date(signedUpAt).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: ADMIN_EMAIL,
    subject: "카페조아 신규 가입 알림",
    html: memberAdminEmail({ name: name || "(이름 없음)", email, provider, joinedAt }),
  });

  // Resend는 실패해도 예외를 던지지 않고 error 객체로 반환하므로,
  // 직접 던져서 호출부(after 콜백)의 catch/로그에 실패 사유가 남게 한다.
  if (error) {
    throw new Error(`Resend 발송 실패: ${error.message}`);
  }
}
