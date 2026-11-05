import { APP_SITE_URL } from "@/lib/constants";
import { emailButton, emailLayout, infoTable } from "./email-layout";

export function supportReceiptEmail({ name, type, title, submittedAt }: { name: string; type: string; title: string; submittedAt: string }): string {
  return emailLayout({
    eyebrow: "CAFEZOA SUPPORT",
    title: `${name}님, 요청이 접수되었습니다!`,
    description: "보내주신 내용을 확인한 뒤 입력한 이메일로 답변드리겠습니다.",
    accent: "#10b981",
    content: `<p style="margin:0 0 20px;font-size:14px;line-height:1.8;color:#374151">카페조아에 소중한 의견을 남겨주셔서 감사합니다. 접수 내용을 순서대로 꼼꼼히 확인하겠습니다.</p>${infoTable([["유형", type], ["제목", title], ["접수 일시", submittedAt]])}${emailButton("카페조아 홈으로", APP_SITE_URL)}`,
    footer: "지원 페이지에서 요청을 접수하여 발송된 메일입니다.",
  });
}
