import "server-only";

import { Resend } from "resend";
import { memberWelcomeEmail } from "@/lib/email/templates/member-welcome-email";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_ADDRESS = "Cafezoa <no-reply@cafezoa.com>";

export async function sendWelcomeUserEmail({
  email,
  name,
  provider = "Google",
}: {
  email: string;
  name: string;
  provider?: string;
}) {
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: "카페조아 가입을 환영합니다",
    html: memberWelcomeEmail({ name: name || "회원", email, provider }),
  });

  // Resend는 실패해도 예외를 던지지 않고 error 객체로 반환하므로,
  // 직접 던져서 호출부(after 콜백)의 catch/로그에 실패 사유가 남게 한다.
  if (error) {
    throw new Error(`Resend 발송 실패: ${error.message}`);
  }
}
