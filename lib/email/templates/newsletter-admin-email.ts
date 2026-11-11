import { APP_SITE_URL } from "@/lib/constants";
import { emailButton, emailLayout, infoTable } from "./email-layout";

export function newsletterAdminEmail({ email, subscribedAt }: { email: string; subscribedAt: string }): string {
  return emailLayout({
    eyebrow: "ADMIN · NEWSLETTER",
    title: "새로운 뉴스레터 구독자입니다 💌",
    description: "신규 구독 정보를 확인해 주세요.",
    accent: "#2563eb",
    content: infoTable([["이메일", email], ["구독 일시", subscribedAt]]) + emailButton("구독자 관리", `${APP_SITE_URL}/admin/newsletter`),
    footer: "카페조아 관리자에게 자동 발송된 메일입니다.",
  });
}
