import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import { FileText } from "lucide-react";
import { PageFooter } from "@/components/page/page-footer";
import { PageHeader } from "@/components/page/page-header";
import { PageTerms } from "@/components/page/page-terms";

const title = "이용약관";
const description = "카페조아 서비스를 이용하시기 전에 꼭 확인해 주세요.";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/terms",
});

export default function Terms() {
  return (
    <>
      <PageHeader
        icon={<FileText className="size-7 sm:size-9" />}
        title={title}
        description={description}
      />
      <PageTerms />
      <PageFooter tone="light" />
    </>
  );
}
