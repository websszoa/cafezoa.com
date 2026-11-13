import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageDetail } from "@/components/page/page-detail";
import { PageFooter } from "@/components/page/page-footer";
import { APP_NAME } from "@/lib/constants";
import {
  getCafeRegion,
  getCafeTypeLabel,
  getShortDescription,
} from "@/lib/utils";

import cafes from "@/data/cafe-basic.json";
import cafeDetails from "@/data/cafe-details.json";

// 상세 정보가 있는 카페만 상세 페이지를 만든다.
export function getCafe(slug: string) {
  if (!(slug in cafeDetails)) return null;
  return cafes.find((cafe) => cafe.slug === slug) ?? null;
}

export function generateStaticParams() {
  return Object.keys(cafeDetails).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/cafe/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const cafe = getCafe(slug);
  if (!cafe) return {};

  // 예) "더티트렁크 - 파주 대형카페" → 화면 탭에는 "더티트렁크 - 파주 대형카페 | 카페조아"
  const title = `${cafe.name} - ${getCafeRegion(cafe.location.address)} ${getCafeTypeLabel(cafe.type[0])}`;
  const description = getShortDescription(cafe.description);
  const url = `/cafe/${slug}`;

  // og:image·twitter:image는 같은 폴더의 opengraph-image.tsx / twitter-image.tsx가 자동으로 채운다.
  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "ko_KR",
      siteName: APP_NAME,
      url,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function CafeDetail({ params }: PageProps<"/cafe/[slug]">) {
  return (
    <>
      <Suspense
        fallback={<div className="min-h-[52vh] bg-bark" aria-hidden="true" />}
      >
        <CafeDetailContent params={params} />
      </Suspense>
      <PageFooter />
    </>
  );
}

async function CafeDetailContent({
  params,
}: Pick<PageProps<"/cafe/[slug]">, "params">) {
  const { slug } = await params;
  if (!getCafe(slug)) notFound();

  return <PageDetail slug={slug} />;
}
