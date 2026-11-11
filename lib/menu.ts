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

export const navigation = [
  { href: "/map", label: "지도", icon: MapPinned },
  { href: "/card", label: "카드", icon: Newspaper },
  { href: "/list", label: "목록", icon: LayoutList },
  { href: "/gallery", label: "이미지", icon: Images },
];

export const supportLinks = [
  { href: "/support?type=inquiry", label: "문의사항", icon: MessageCircleQuestion },
  { href: "/support?type=correction", label: "수정요청", icon: FilePenLine },
  { href: "/support?type=complaint", label: "불편신고", icon: CircleAlert },
  { href: "/support?type=registration", label: "등록문의", icon: ClipboardPlus },
];

export const legalLinks = [
  { href: "/about", label: "소개", icon: Info },
  { href: "/policy", label: "운영정책", icon: ClipboardList },
  { href: "/terms", label: "이용약관", icon: FileText },
  { href: "/privacy", label: "개인정보처리방침", icon: ShieldCheck },
];
