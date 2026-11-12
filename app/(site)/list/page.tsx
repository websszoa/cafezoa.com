import type { Metadata } from "next";
import { LayoutList } from "lucide-react";
import { PageFooter } from "@/components/page/page-footer";
import { PageHeader } from "@/components/page/page-header";
import { PageList } from "@/components/page/page-list";

const title = "한눈에 보는 카페 목록";
const description = "지역과 테마별로 정리된 전국 카페를 빠르게 찾아보세요!";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/list",
  },
};

export default function List() {
  return (
    <>
      <PageHeader
        icon={<LayoutList className="size-7 sm:size-9" />}
        title={title}
        description={description}
        tone="dark"
      />
      <PageList />
      <PageFooter />
    </>
  );
}
