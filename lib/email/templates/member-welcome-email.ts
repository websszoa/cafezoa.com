import { APP_SITE_URL } from "@/lib/constants";
import { emailButton, emailLayout, infoTable } from "./email-layout";

export function memberWelcomeEmail({ name, email, provider }: { name: string; email: string; provider: string }): string {
  return emailLayout({
    eyebrow: "WELCOME TO CAFEZOA",
    title: `${name}님, 가입을 환영합니다!`,
    description: "전국의 멋진 카페 소식을 카페조아에서 편하게 확인하세요.",
    content: `<p style="margin:0 0 20px;font-size:14px;line-height:1.8;color:#374151">지도, 카드, 목록, 갤러리 등 다양한 방식으로 전국의 카페 정보를 한곳에서 만나보세요.</p>${infoTable([["이메일", email], ["가입 방식", provider]])}${emailButton("카페 둘러보러 가기", APP_SITE_URL)}`,
    footer: "카페조아 회원가입을 완료하여 발송된 메일입니다.",
  });
}
