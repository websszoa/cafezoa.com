import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { PageCard } from "@/components/page/page-card";
import { PageFooter } from "@/components/page/page-footer";
import { PageHeader } from "@/components/page/page-header";

const title = "취향별 카페 이야기";
const description = "전국의 특별한 카페와 공간 이야기를 한곳에서 만나보세요!";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/card",
  },
};

export default function Card() {
  return (
    <>
      <PageHeader
        icon={<Newspaper className="size-7 sm:size-9" />}
        title={title}
        description={description}
        tone="dark"
      />
      <PageCard />
      <PageFooter />
    </>
  );
}
