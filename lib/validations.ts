import { z } from "zod";

export const supportFormSchema = z.object({
  name: z.string().trim().min(1, "이름을 입력해 주세요."),
  email: z.email("올바른 이메일 주소를 입력해 주세요."),
  subject: z.string().trim().min(1, "제목을 입력해 주세요."),
  relatedUrl: z.union([
    z.literal(""),
    z.url("올바른 주소를 입력해 주세요. (https://로 시작)"),
  ]),
  content: z.string().trim().min(10, "내용을 10자 이상 입력해 주세요."),
  privacyConsent: z
    .boolean()
    .refine((value) => value, "개인정보처리방침에 동의해 주세요."),
});

export type SupportFormValues = z.infer<typeof supportFormSchema>;
