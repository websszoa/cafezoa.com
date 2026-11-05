import { APP_SITE_URL } from "@/lib/constants";
import { emailButton, emailLayout, infoTable, messageBox } from "./email-layout";

export function supportAdminEmail({ type, name, email, title, content, submittedAt }: { type: string; name: string; email: string; title: string; content: string; submittedAt: string }): string {
  return emailLayout({
    eyebrow: "ADMIN · SUPPORT",
    title: `${type}이 접수되었습니다 📩`,
    description: "새로운 지원 요청 내용을 확인해 주세요.",
    accent: "#f59e0b",
    content: infoTable([["유형", type], ["이름", name], ["이메일", email], ["제목", title], ["접수 일시", submittedAt]]) + messageBox(content) + emailButton("문의 관리", `${APP_SITE_URL}/admin/contact`),
    footer: "카페조아 관리자에게 자동 발송된 메일입니다.",
  });
}
