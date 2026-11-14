import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import { Heart } from "lucide-react";
import { PageFooter } from "@/components/page/page-footer";
import { PageHeader } from "@/components/page/page-header";
import { PageTaste } from "@/components/page/page-taste";

const title = "당신이 좋아하는 카페는?";
const description =
  "유형·뷰·서비스·목적을 고르면 취향에 꼭 맞는 카페를 찾아드려요!";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/taste",
});

export default function Taste() {
  return (
    <>
      <PageHeader
        icon={<Heart className="size-7 sm:size-9" />}
        title={title}
        description={description}
        tone="dark"
      />
      <PageTaste />
      <PageFooter />
    </>
  );
}
