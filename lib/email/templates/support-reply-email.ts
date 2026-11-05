import { APP_SITE_URL } from "@/lib/constants";
import { emailButton, emailLayout, infoTable, messageBox } from "./email-layout";

export function supportReplyEmail({
  name,
  type,
  title,
  reply,
  repliedAt,
}: {
  name: string;
  type: string;
  title: string;
  reply: string;
  repliedAt: string;
}): string {
  return emailLayout({
    eyebrow: "CAFEZOA SUPPORT",
    title: `${name}님, 문의하신 내용에 답변드립니다!`,
    description: "카페조아에 남겨주신 문의를 확인하고 답변을 보내드립니다.",
    accent: "#ff5b20",
    content: `${infoTable([
      ["유형", type],
      ["문의 제목", title],
      ["답변 일시", repliedAt],
    ])}${messageBox(reply)}${emailButton("카페조아 바로가기", APP_SITE_URL)}`,
    footer: "카페조아 관리자가 문의에 답변하여 발송된 메일입니다.",
  });
}
