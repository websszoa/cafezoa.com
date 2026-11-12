import type { Metadata } from "next";
import { Info } from "lucide-react";
import { PageAbout } from "@/components/page/page-about";
import { PageFooter } from "@/components/page/page-footer";
import { PageHeader } from "@/components/page/page-header";

const title = "카페조아 소개";
const description = "좋은 카페를 소중한 사람들과 나누고 싶은 마음으로 시작했어요!";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/about",
  },
};

export default function About() {
  return (
    <>
      <PageHeader
        icon={<Info className="size-7 sm:size-9" />}
        title={title}
        description={description}
      />
      <PageAbout />
      <PageFooter />
    </>
  );
}
