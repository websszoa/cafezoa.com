import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import { Images } from "lucide-react";
import { PageGallery } from "@/components/page/page-gallery";
import { PageFooter } from "@/components/page/page-footer";
import { PageHeader } from "@/components/page/page-header";

const title = "사진으로 보는 카페";
const description = "감성 가득한 카페 사진을 둘러보며 마음에 드는 곳을 찾아보세요!";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/gallery",
});

export default function Gallery() {
  return (
    <>
      <PageHeader
        icon={<Images className="size-7 sm:size-9" />}
        title={title}
        description={description}
        tone="dark"
      />
      <PageGallery />
      <PageFooter />
    </>
  );
}
