import { APP_INSTAGRAM_URL, APP_THREADS_URL } from "@/lib/constants";

import {
  AtSign,
  CircleAlert,
  ClipboardList,
  ClipboardPlus,
  FilePenLine,
  FileText,
  Heart,
  Images,
  Info,
  LayoutList,
  MapPinned,
  MessageCircle,
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

export const footerLinks = [
  {
    title: "Explore",
    label: "탐색 메뉴",
    links: introLinks,
  },
  {
    title: "Support",
    label: "고객지원 메뉴",
    links: [
      {
        href: "/support?type=inquiry",
        label: "문의사항",
        icon: MessageCircleQuestion,
      },
      {
        href: "/support?type=correction",
        label: "수정요청",
        icon: FilePenLine,
      },
      { href: "/support?type=complaint", label: "불편신고", icon: CircleAlert },
      {
        href: "/support?type=registration",
        label: "등록문의",
        icon: ClipboardPlus,
      },
    ],
  },
  {
    title: "Policy",
    label: "정책 메뉴",
    links: [
      { href: "/about", label: "소개", icon: Info },
      { href: "/policy", label: "운영정책", icon: ClipboardList },
      { href: "/terms", label: "이용약관", icon: FileText },
      { href: "/privacy", label: "개인정보처리방침", icon: ShieldCheck },
    ],
  },
  {
    title: "Social",
    label: "소셜 미디어",
    links: [
      {
        href: APP_INSTAGRAM_URL,
        label: "Instagram",
        icon: AtSign,
        external: true,
      },
      {
        href: APP_THREADS_URL,
        label: "Threads",
        icon: MessageCircle,
        external: true,
      },
    ],
  },
  // 시험 중인 페이지. 메뉴에는 두지 않고 푸터에서만 연결한다.
  {
    title: "Lab",
    label: "시험 페이지 메뉴",
    links: [{ href: "/taste", label: "취향 찾기", icon: Heart }],
  },
];
