import { z } from "zod";
import {
  subscribeAgeGroupValues,
  subscribePriorityValues,
  subscribeSourceValues,
  subscribeStyleValues,
} from "@/lib/subscribe";

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

// 구독 신청 폼 (components/dialog/dialog-subscribe.tsx)
export const subscribeFormSchema = z.object({
  email: z.email("올바른 이메일 주소를 입력해 주세요."),
  ageGroup: z.enum(subscribeAgeGroupValues, "나이대를 선택해 주세요."),
  source: z.enum(subscribeSourceValues, "알게 된 경로를 선택해 주세요."),
  // 좋아하는 카페 스타일. 선택 항목(복수 선택)이라 비워 둬도 된다.
  styles: z.array(z.enum(subscribeStyleValues)),
  // 카페를 방문할 때 중요하게 생각하는 것. 선택 항목(복수 선택)이라 비워 둬도 된다.
  priorities: z.array(z.enum(subscribePriorityValues)),
  // 가장 받고 싶은 정보. 선택 항목(주관식)이라 비워 둬도 된다.
  wish: z.string().trim().max(200, "200자 이내로 입력해 주세요."),
  privacyConsent: z
    .boolean()
    .refine((value) => value, "개인정보처리방침에 동의해 주세요."),
});

export type SubscribeFormValues = z.infer<typeof subscribeFormSchema>;
