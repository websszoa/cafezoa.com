import type { Metadata } from "next";
import { PageIntro } from "@/components/page/page-intro";

// 제목·설명·공유 미리보기는 루트 레이아웃 기본값을 쓰고, canonical만 홈으로 지정한다.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return <PageIntro />;
}
