import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { PageFooter } from "@/components/page/page-footer";
import { PageHeader } from "@/components/page/page-header";
import { PagePrivacy } from "@/components/page/page-privacy";

const title = "개인정보처리방침";
const description = "카페조아가 개인정보를 어떻게 수집하고 보호하는지 안내해 드려요.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/privacy",
  },
};

export default function Privacy() {
  return (
    <>
      <PageHeader
        icon={<ShieldCheck className="size-7 sm:size-9" />}
        title={title}
        description={description}
      />
      <PagePrivacy />
      <PageFooter />
    </>
  );
}
