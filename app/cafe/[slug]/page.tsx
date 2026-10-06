import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CafeDetailPage } from "@/components/page/page-cafe-detail";
import { APP_NAME, APP_SITE_URL } from "@/lib/constants";
import { cafes, type Cafe } from "@/lib/utils";

export const dynamicParams = false;

export function generateStaticParams() {
  return cafes.map((cafe) => ({ slug: cafe.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/cafe/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const cafe = cafes.find((item) => item.slug === slug);

  if (!cafe) return {};

  const description = metadataDescription(cafe.description);
  const path = `/cafe/${cafe.slug}`;

  return {
    title: cafe.name,
    description,
    alternates: {
      canonical: path,
      languages: { "ko-KR": path },
    },
    openGraph: {
      type: "website",
      locale: "ko_KR",
      siteName: APP_NAME,
      url: path,
      title: `${cafe.name} | ${APP_NAME}`,
      description,
      images: [{ url: cafe.thumbnail, alt: `${cafe.name} 대표 전경` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${cafe.name} | ${APP_NAME}`,
      description,
      images: [cafe.thumbnail],
    },
  };
}

export default async function CafePage({ params }: PageProps<"/cafe/[slug]">) {
  const { slug } = await params;
  const cafe = cafes.find((item) => item.slug === slug);

  if (!cafe) notFound();

  const structuredData = cafeStructuredData(cafe);
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "홈",
        item: APP_SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "카페 블로그",
        item: `${APP_SITE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: cafe.name,
        item: `${APP_SITE_URL}/cafe/${cafe.slug}`,
      },
    ],
  };

  return (
    <>
      {[structuredData, breadcrumbData].map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data).replace(/</g, "\\u003c"),
          }}
        />
      ))}
      <CafeDetailPage cafe={cafe} />
    </>
  );
}

function metadataDescription(description: string) {
  const firstSentence = description.split(". ")[0];
  return `${firstSentence}. 카페 위치, 영업시간, 주차, 좌석과 이용 정보를 확인해 보세요.`;
}

function cafeStructuredData(cafe: Cafe) {
  const dayNames: Record<string, string> = {
    월요일: "Monday",
    화요일: "Tuesday",
    수요일: "Wednesday",
    목요일: "Thursday",
    금요일: "Friday",
    토요일: "Saturday",
    일요일: "Sunday",
  };
  const sameAs = [
    cafe.website,
    cafe.instagram
      ? `https://www.instagram.com/${cafe.instagram}/`
      : undefined,
  ].filter((url): url is string => Boolean(url));
  const prices = Object.values(cafe.prices);
  const dateModified = [cafe.naver?.[0], cafe.google?.[0]]
    .filter((date): date is string => Boolean(date))
    .sort()
    .at(-1);

  return {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    "@id": `${APP_SITE_URL}/cafe/${cafe.slug}#cafe`,
    mainEntityOfPage: `${APP_SITE_URL}/cafe/${cafe.slug}`,
    name: cafe.name,
    description: cafe.description,
    url: `${APP_SITE_URL}/cafe/${cafe.slug}`,
    image: [cafe.thumbnail, ...cafe.galleryImages].map(
      (image) => `${APP_SITE_URL}${image}`,
    ),
    telephone: cafe.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: cafe.location.address,
      addressCountry: "KR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: cafe.location.latitude,
      longitude: cafe.location.longitude,
    },
    openingHoursSpecification: Object.entries(cafe.businessHours).map(
      ([day, hours]) => {
        const [opens, closes] = hours.split(" ~ ");
        return {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: dayNames[day],
          opens,
          closes,
        };
      },
    ),
    servesCuisine: cafe.serviceLabels,
    priceRange:
      prices.length > 0
        ? `₩${Math.min(...prices).toLocaleString()}–₩${Math.max(...prices).toLocaleString()}`
        : undefined,
    sameAs,
    dateModified,
  };
}
