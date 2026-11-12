import type { Metadata } from "next";
import { Suspense } from "react";

import { PageFooter } from "@/components/page/page-footer";
import { PageHeader } from "@/components/page/page-header";
import { PageSupport } from "@/components/page/page-support";
import { supportTypes } from "@/lib/support";

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

  return {
    title,
    description,
    alternates: {
      canonical: "/support",
    },
  };
}

export default function Support({ searchParams }: PageProps<"/support">) {
  const { title, description, icon: Icon } = supportTypes.default;

  return (
    <>
      <Suspense
        fallback={
          <PageHeader
            icon={<Icon className="size-7 sm:size-9" />}
            title={title}
            description={description}
          />
        }
      >
        <SupportHeader searchParams={searchParams} />
      </Suspense>
      <PageSupport />
      <PageFooter tone="light" />
    </>
  );
}

async function SupportHeader({
  searchParams,
}: Pick<PageProps<"/support">, "searchParams">) {
  const { title, description, icon: Icon } = await getSupportType(searchParams);

  return (
    <PageHeader
      icon={<Icon className="size-7 sm:size-9" />}
      title={title}
      description={description}
    />
  );
}
