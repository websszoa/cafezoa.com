import {
  CircleAlert,
  ClipboardPlus,
  FilePenLine,
  MessageCircleQuestion,
} from "lucide-react";

export const supportTypes = {
  default: {
    title: "고객센터",
    description:
      "문의, 수정 요청, 불편 신고, 카페 등록까지 무엇이든 남겨주세요!",
    icon: MessageCircleQuestion,
  },
  inquiry: {
    title: "문의사항",
    description: "카페조아 이용 중 궁금한 점이 있다면 편하게 물어봐 주세요!",
    icon: MessageCircleQuestion,
  },
  correction: {
    title: "수정요청",
    description: "카페 정보가 실제와 다르다면 알려주세요. 빠르게 바로잡을게요!",
    icon: FilePenLine,
  },
  complaint: {
    title: "불편신고",
    description: "이용하면서 불편했던 점을 남겨주시면 꼼꼼히 확인할게요.",
    icon: CircleAlert,
  },
  registration: {
    title: "등록문의",
    description: "소개하고 싶은 카페가 있다면 카페조아에 등록을 요청해 주세요!",
    icon: ClipboardPlus,
  },
};
