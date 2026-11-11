import {
  CircleAlert,
  ClipboardList,
  ClipboardPlus,
  FilePenLine,
  FileText,
  Images,
  Info,
  LayoutList,
  MapPinned,
  MessageCircleQuestion,
  Newspaper,
  ShieldCheck,
} from "lucide-react";

export const introLinks = [
  {
    href: "/map",
    label: "지도",
    description: "지도 유형으로 보기",
    icon: MapPinned,
  },
  {
    href: "/card",
    label: "카드",
    description: "카드 형식으로 보기",
    icon: Newspaper,
  },
  {
    href: "/list",
    label: "목록",
    description: "목록 형식으로 보기",
    icon: LayoutList,
  },
  {
    href: "/gallery",
    label: "이미지",
    description: "이미지로 보기",
    icon: Images,
  },
];

export const supportLinks = [
  {
    href: "/support?type=inquiry",
    label: "문의사항",
    icon: MessageCircleQuestion,
  },
  { href: "/support?type=correction", label: "수정요청", icon: FilePenLine },
  { href: "/support?type=complaint", label: "불편신고", icon: CircleAlert },
  {
    href: "/support?type=registration",
    label: "등록문의",
    icon: ClipboardPlus,
  },
];

export const legalLinks = [
  { href: "/about", label: "소개", icon: Info },
  { href: "/policy", label: "운영정책", icon: ClipboardList },
  { href: "/terms", label: "이용약관", icon: FileText },
  { href: "/privacy", label: "개인정보처리방침", icon: ShieldCheck },
];
