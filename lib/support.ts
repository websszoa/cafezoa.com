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
    guideTitle: "무엇이든 물어보세요",
    guideDescription:
      "서비스 이용 방법, 계정, 제휴 제안처럼 궁금한 점을 남겨주시면 확인 후 이메일로 답변드려요.",
    guides: [
      "답변은 영업일 기준 1~3일 안에 입력하신 이메일로 보내드려요.",
      "관련 페이지 주소를 함께 적어주시면 더 빠르게 확인할 수 있어요.",
      "카페 정보 수정이나 불편 사항은 해당 메뉴를 이용해 주세요.",
    ],
    formTitle: "문의 내용 작성",
    formDescription: "* 표시된 항목은 꼭 입력해 주세요.",
    subjectPlaceholder: "문의 제목을 입력하세요",
    contentLabel: "문의 내용",
    contentPlaceholder: "궁금한 점을 자세히 적어주세요.",
  },
  correction: {
    title: "수정요청",
    description: "카페 정보가 실제와 다르다면 알려주세요. 빠르게 바로잡을게요!",
    icon: FilePenLine,
    guideTitle: "잘못된 정보를 알려주세요",
    guideDescription:
      "영업시간, 메뉴, 주소처럼 실제와 다른 카페 정보를 알려주시면 확인 후 바로잡을게요.",
    guides: [
      "수정할 카페의 페이지 주소를 함께 적어주세요.",
      "공식 채널이나 사진처럼 확인할 수 있는 근거가 있으면 더 빠르게 반영돼요.",
      "확인이 끝나면 처리 결과를 이메일로 알려드려요.",
    ],
    formTitle: "수정 요청 작성",
    formDescription: "* 표시된 항목은 꼭 입력해 주세요.",
    subjectPlaceholder: "예: ○○카페 영업시간 수정 요청",
    contentLabel: "수정할 내용",
    contentPlaceholder: "현재 표시된 정보와 올바른 정보를 함께 적어주세요.",
  },
  complaint: {
    title: "불편신고",
    description: "이용하면서 불편했던 점을 남겨주시면 꼼꼼히 확인할게요.",
    icon: CircleAlert,
    guideTitle: "불편한 점을 알려주세요",
    guideDescription:
      "서비스를 이용하며 겪은 오류나 불편 사항을 남겨주시면 꼼꼼히 확인하고 개선할게요.",
    guides: [
      "문제가 생긴 페이지와 상황을 구체적으로 적어주세요.",
      "사용 중인 기기와 브라우저를 알려주시면 원인을 찾는 데 도움이 돼요.",
      "권리 침해 신고는 권리자임을 확인할 수 있는 자료를 함께 보내주세요.",
    ],
    formTitle: "불편 신고 작성",
    formDescription: "* 표시된 항목은 꼭 입력해 주세요.",
    subjectPlaceholder: "예: 지도 화면이 열리지 않아요",
    contentLabel: "불편 내용",
    contentPlaceholder: "언제, 어디서, 어떤 문제가 있었는지 자세히 적어주세요.",
  },
  registration: {
    title: "등록문의",
    description: "소개하고 싶은 카페가 있다면 카페조아에 등록을 요청해 주세요!",
    icon: ClipboardPlus,
    guideTitle: "새로운 카페를 소개해 주세요",
    guideDescription:
      "소개하고 싶은 카페가 있다면 등록을 요청해 주세요. 확인을 거쳐 카페조아에 소개할게요.",
    guides: [
      "카페 이름과 주소, 공식 채널 주소를 함께 적어주세요.",
      "운영자라면 영업시간과 대표 메뉴를 알려주시면 더 정확하게 소개할 수 있어요.",
      "등록 여부와 시기는 운영 기준에 따라 검토한 뒤 안내드려요.",
    ],
    formTitle: "등록 문의 작성",
    formDescription: "* 표시된 항목은 꼭 입력해 주세요.",
    subjectPlaceholder: "예: ○○카페 등록 요청",
    contentLabel: "카페 소개",
    contentPlaceholder:
      "카페 이름, 주소, 특징 등 소개하고 싶은 내용을 적어주세요.",
  },
};

export type SupportFormType = Exclude<keyof typeof supportTypes, "default">;

export function getSupportFormType(type: unknown): SupportFormType {
  return typeof type === "string" && type in supportTypes && type !== "default"
    ? (type as SupportFormType)
    : "inquiry";
}
