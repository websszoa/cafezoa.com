import { APP_SITE_URL } from "@/lib/constants";
import { emailButton, emailLayout, infoTable } from "./email-layout";

export function memberAdminEmail({ name, email, provider, joinedAt }: { name: string; email: string; provider: string; joinedAt: string }): string {
  return emailLayout({
    eyebrow: "ADMIN · NEW MEMBER",
    title: "새로운 회원이 가입했습니다 🎉",
    description: "카페조아 신규 회원 정보를 확인해 주세요.",
    content: infoTable([["이름", name], ["이메일", email], ["가입 방식", provider], ["가입 일시", joinedAt]]) + emailButton("회원 관리", APP_SITE_URL),
    footer: "카페조아 관리자에게 자동 발송된 메일입니다.",
  });
}
