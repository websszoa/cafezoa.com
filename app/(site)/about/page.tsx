import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import { Info } from "lucide-react";
import { PageAbout } from "@/components/page/page-about";
import { PageFooter } from "@/components/page/page-footer";
import { PageHeader } from "@/components/page/page-header";

const title = "카페조아 소개";
const description =
  "좋은 카페를 소중한 사람들과 나누고 싶은 마음으로 시작했어요!";

// <title>은 "%s | 카페조아" 형식이라, 화면 제목(카페조아 소개)을 그대로 쓰면 이름이 두 번 들어간다.
export const metadata: Metadata = createPageMetadata({
  title: "서비스 소개",
  description,
  path: "/about",
});

export default function About() {
  return (
    <>
      <PageHeader
        icon={<Info className="size-7 sm:size-9" />}
        title={title}
        description={description}
      />
      <PageAbout />
      <PageFooter tone="light" />
    </>
  );
}
