import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import { Suspense } from "react";

import { PageFooter } from "@/components/page/page-footer";
import { PageHeader } from "@/components/page/page-header";
import { PageSupport } from "@/components/page/page-support";
import { getSupportFormType, supportTypes } from "@/lib/support";

async function getSupportType(
  searchParams: PageProps<"/support">["searchParams"],
) {
  const { type } = await searchParams;
  return typeof type === "string" && type in supportTypes
    ? supportTypes[type as keyof typeof supportTypes]
    : supportTypes.default;
}

export async function generateMetadata({
  searchParams,
}: PageProps<"/support">): Promise<Metadata> {
  const { title, description } = await getSupportType(searchParams);

  // ?type=에 따라 제목은 바뀌지만 canonical은 /support 하나로 모은다.
  return createPageMetadata({ title, description, path: "/support" });
}

export default function Support({ searchParams }: PageProps<"/support">) {
  const { title, description, icon: Icon } = supportTypes.default;

  return (
    <>
      <Suspense
        fallback={
          <>
            <PageHeader
              icon={<Icon className="size-7 sm:size-9" />}
              title={title}
              description={description}
            />
            <PageSupport type="inquiry" />
          </>
        }
      >
        <SupportContent searchParams={searchParams} />
      </Suspense>
      <PageFooter tone="light" />
    </>
  );
}

async function SupportContent({
  searchParams,
}: Pick<PageProps<"/support">, "searchParams">) {
  const { title, description, icon: Icon } = await getSupportType(searchParams);
  const formType = getSupportFormType((await searchParams).type);

  return (
    <>
      <PageHeader
        icon={<Icon className="size-7 sm:size-9" />}
        title={title}
        description={description}
      />
      <PageSupport key={formType} type={formType} />
    </>
  );
}
