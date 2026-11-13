import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import { ClipboardList } from "lucide-react";
import { PageFooter } from "@/components/page/page-footer";
import { PageHeader } from "@/components/page/page-header";
import { PagePolicy } from "@/components/page/page-policy";

const title = "운영정책";
const description = "모두가 즐겁게 이용할 수 있도록 카페조아의 운영 원칙을 안내해 드려요.";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/policy",
});

export default function Policy() {
  return (
    <>
      <PageHeader
        icon={<ClipboardList className="size-7 sm:size-9" />}
        title={title}
        description={description}
      />
      <PagePolicy />
      <PageFooter tone="light" />
    </>
  );
}
