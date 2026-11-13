import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { CafeCard } from "@/components/page/page-card-prop";
import { Button } from "@/components/ui/button";
import { cafeInfoNotices } from "@/lib/document";
import { APP_IMAGE_BASE_URL, APP_NAME, APP_SITE_URL } from "@/lib/constants";
import {
  distanceBetween,
  getCafeRegion,
  getCafeTypeLabel,
  getLatestRating,
  type LatestRating,
} from "@/lib/utils";
import {
  BackButton,
  CafeLocationMap,
  DetailGalleryImage,
} from "@/components/page/page-detail-prop";
import {
  AtSign,
  Baby,
  BookOpenCheck,
  Building2,
  Car,
  ChevronRight,
  Cigarette,
  Clock3,
  Coffee,
  ExternalLink,
  Eye,
  Globe2,
  MapPin,
  PawPrint,
  Phone,
  Rows3,
  Sparkles,
  Star,
  Toilet,
  Users,
} from "lucide-react";

import cafes from "@/data/cafe-basic.json";
import cafeDetails from "@/data/cafe-details.json";

type Cafe = (typeof cafes)[number];

// 카페마다 들어 있는 항목이 조금씩 달라서, 모든 항목을 선택값으로 둔다.
type CafeDetail = {
  services?: string[];
  purpose?: string[];
  features?: string[];
  floors?: string[];
  parking?: string[];
  pet?: string[];
  restroom?: string[];
  children?: string[];
  study?: string[];
  smoking?: string[];
  view?: string[];
  seating?: string[];
  business?: { closed_days?: string; hours?: Record<string, string> };
  price?: Record<string, number | null>;
  media: {
    phone?: string | null;
    website?: string | null;
    instagram?: string | null;
    gallery: string[];
  };
};

const details = cafeDetails as Record<string, CafeDetail>;

// GitHub Pages에 올라간 이미지 주소. (예: /cafe/{slug}-01.webp → .../public/cafe/{slug}-01.webp)
function getImageUrl(path: string) {
  return `${APP_IMAGE_BASE_URL}${path.replace(/^\//, "")}`;
}

// 카페 대표 이미지 주소.
function getCafeImage(slug: string) {
  return `${APP_IMAGE_BASE_URL}cafe/${slug}-02.webp`;
}

// 같은 유형이 많이 겹치는 순, 같으면 가까운 순으로 추천 카페 3곳.
function getRelatedCafes(currentCafe: Cafe) {
  return cafes
    .filter((cafe) => cafe.slug !== currentCafe.slug && cafe.slug in details)
    .map((cafe) => {
      const sharedTypes = cafe.type.filter((type) =>
        currentCafe.type.includes(type),
      );
      const distance = distanceBetween(
        currentCafe.location.latitude,
        currentCafe.location.longitude,
        cafe.location.latitude,
        cafe.location.longitude,
      );
      return { cafe, distance, sharedTypes };
    })
    .sort(
      (a, b) =>
        b.sharedTypes.length - a.sharedTypes.length || a.distance - b.distance,
    )
    .slice(0, 3);
}

// 영업시간 요일 → schema.org 요일
const SCHEMA_DAYS: Record<string, string> = {
  월요일: "https://schema.org/Monday",
  화요일: "https://schema.org/Tuesday",
  수요일: "https://schema.org/Wednesday",
  목요일: "https://schema.org/Thursday",
  금요일: "https://schema.org/Friday",
  토요일: "https://schema.org/Saturday",
  일요일: "https://schema.org/Sunday",
};

// 검색엔진용 구조화 데이터(JSON-LD). 카페 정보(CafeOrCoffeeShop)와 브레드크럼(BreadcrumbList).
// 네이버·구글 평점은 다른 사이트의 평점이라 구글 가이드라인상 aggregateRating으로 넣지 않는다.
function getCafeJsonLd(cafe: Cafe, detail: CafeDetail, gallery: string[]) {
  const url = `${APP_SITE_URL}/cafe/${cafe.slug}`;
  const { phone, website, instagram } = detail.media;

  // "09:30 ~ 21:30" 형식만 변환하고, "휴무" 등은 건너뛴다.
  const openingHours = Object.entries(detail.business?.hours ?? {}).flatMap(
    ([day, time]) => {
      const match = time.match(/^(\d{2}:\d{2})\s*~\s*(\d{2}:\d{2})$/);
      if (!match || !SCHEMA_DAYS[day]) return [];
      return [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: SCHEMA_DAYS[day],
          opens: match[1],
          closes: match[2] === "24:00" ? "23:59" : match[2],
        },
      ];
    },
  );

  const sameAs = [
    website,
    instagram ? `https://www.instagram.com/${instagram}/` : null,
  ].filter(Boolean);

  return [
    {
      "@context": "https://schema.org",
      "@type": "CafeOrCoffeeShop",
      "@id": `${url}#cafe`,
      name: cafe.name,
      description: cafe.description,
      url,
      image: [getCafeImage(cafe.slug), ...gallery.map(getImageUrl)],
      address: {
        "@type": "PostalAddress",
        streetAddress: cafe.location.address,
        addressRegion: cafe.location.address.split(" ")[0],
        addressCountry: "KR",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: cafe.location.latitude,
        longitude: cafe.location.longitude,
      },
      ...(phone && { telephone: phone }),
      ...(sameAs.length > 0 && { sameAs }),
      ...(openingHours.length > 0 && {
        openingHoursSpecification: openingHours,
      }),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: APP_NAME,
          item: APP_SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "카페 목록",
          item: `${APP_SITE_URL}/list`,
        },
        { "@type": "ListItem", position: 3, name: cafe.name, item: url },
      ],
    },
  ];
}

export function PageDetail({ slug }: { slug: string }) {
  const cafe = cafes.find((item) => item.slug === slug);
  const detail = details[slug];
  if (!cafe || !detail) return null;

  const naver = getLatestRating(cafe.ratings, "naver");
  const google = getLatestRating(cafe.ratings, "google");
  const { phone, website, instagram } = detail.media;
  const gallery = detail.media.gallery.slice(0, -1); // 마지막 사진은 카페와 관련 없는 이미지라 제외한다.
  const instagramUrl = instagram
    ? `https://www.instagram.com/${instagram}/`
    : null;
  const naverMapUrl = `https://map.naver.com/p/search/${encodeURIComponent(cafe.name)}`;
  const kakaoMapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(cafe.name)},${cafe.location.latitude},${cafe.location.longitude}`;
  const hours = detail.business?.hours ?? {};
  const closedDays = detail.business?.closed_days;
  const prices = detail.price ?? {};
  const relatedCafes = getRelatedCafes(cafe);
  // 예) "파주 대형카페" — 이미지 대체 텍스트 등에 쓴다.
  const regionLabel = `${getCafeRegion(cafe.location.address)} ${getCafeTypeLabel(cafe.type[0])}`;

  return (
    <main className="min-h-dvh bg-cream text-bark">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getCafeJsonLd(cafe, detail, gallery)).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />
      <section className="relative isolate min-h-[52vh] overflow-hidden bg-bark text-white">
        {/* Next 이미지 최적화(/_next/image)를 거치지 않고 GitHub 주소에서 바로 불러온다. (서버 트래픽 절약) */}
        <Image
          unoptimized
          src={getCafeImage(slug)}
          alt={`${cafe.name} 대표 전경 (${regionLabel})`}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-linear-to-t from-bark via-bark/85 to-black/55" />

        <div className="relative mx-auto flex min-h-[52vh] max-w-7xl flex-col justify-between px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex min-w-0 items-center gap-3">
            <BackButton />
            <nav aria-label="현재 위치" className="min-w-0">
              <ol className="flex min-w-0 items-center gap-1.5 text-xs font-bold text-white/80">
                <li className="shrink-0">
                  <Link
                    href="/"
                    className="hover:text-white hover:underline underline-offset-3"
                  >
                    홈
                  </Link>
                </li>
                <li aria-hidden="true" className="shrink-0">
                  <ChevronRight className="size-3.5" />
                </li>
                <li className="shrink-0">
                  <Link
                    href="/list"
                    className="hover:text-white hover:underline underline-offset-3"
                  >
                    카페 목록
                  </Link>
                </li>
                <li aria-hidden="true" className="shrink-0">
                  <ChevronRight className="size-3.5" />
                </li>
                <li aria-current="page" className="truncate text-white">
                  {cafe.name}
                </li>
              </ol>
            </nav>
          </div>

          <div className="pb-8 sm:pb-12">
            <div className="flex flex-wrap gap-2">
              {cafe.type.map((type) => (
                <span
                  key={type}
                  className="rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur-md"
                >
                  #{type.replace(/\s+/g, "")}
                </span>
              ))}
            </div>
            <h1 className="font-paperlogy mt-5 text-[clamp(2.8rem,8vw,5.5rem)] leading-[0.95] font-semibold">
              {cafe.name}
            </h1>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <section>
          <SectionHeading eyebrow="Cafe story">
            이 공간을 소개해요!
          </SectionHeading>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem]">
            <div className="rounded-3xl border-2 border-bark bg-white p-6 sm:p-8">
              <h3 className="font-paperlogy text-2xl text-bark">{cafe.name}</h3>
              <p className="mt-4 text-base leading-8 text-[#795f55] sm:text-lg">
                {cafe.description}
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {cafe.type.map((type) => (
                  <span
                    key={type}
                    className="rounded-full border-2 border-bark bg-leaf px-3 py-1.5 text-xs font-bold"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <aside className="rounded-3xl border-2 border-bark bg-white p-6">
              <div className="grid grid-cols-2 gap-3">
                <RatingBox label="네이버" rating={naver} />
                <RatingBox label="Google" rating={google} />
              </div>
              <div className="mt-6 space-y-3 border-t border-[#ead9ca] pt-5 text-sm">
                {phone && (
                  <ContactLink href={`tel:${phone}`} icon={<Phone />}>
                    {phone}
                  </ContactLink>
                )}
                <ContactLink href={naverMapUrl} icon={<MapPin />} external>
                  네이버 지도에서 보기
                </ContactLink>
                {website && (
                  <ContactLink href={website} icon={<Globe2 />} external>
                    공식 웹사이트
                  </ContactLink>
                )}
                {instagramUrl && (
                  <ContactLink href={instagramUrl} icon={<AtSign />} external>
                    @{instagram}
                  </ContactLink>
                )}
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-16 sm:mt-24">
          <SectionHeading eyebrow="Information">
            방문 전에 알아두면 좋아요!
          </SectionHeading>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <InfoCard icon={<Clock3 />} title="영업시간">
              <div className="space-y-2">
                {Object.keys(hours).length === 0 && <p>정보 없음</p>}
                {Object.entries(hours).map(([day, time]) => (
                  <div key={day} className="flex justify-between gap-4">
                    <span className="text-[#684d3e]">{day}</span>
                    <span className="font-bold">{time}</span>
                  </div>
                ))}
                <p className="border-t border-[#ead9ca] pt-3 font-bold text-autumn">
                  {closedDays === "연중무휴"
                    ? closedDays
                    : `휴무 · ${closedDays ?? "정보 없음"}`}
                </p>
              </div>
            </InfoCard>
            <InfoCard icon={<Coffee />} title="메뉴·서비스">
              <div className="space-y-5">
                <TagList items={detail.services ?? []} />
                {Object.keys(prices).length > 0 && (
                  <div className="space-y-2 border-t border-[#ead9ca] pt-4">
                    <p className="font-bold text-bark">대표 가격</p>
                    {Object.entries(prices).map(([menu, price]) => (
                      <div key={menu} className="flex justify-between gap-4">
                        <span>{menu}</span>
                        <span className="font-bold">
                          {price === null
                            ? "가격 정보 없음"
                            : `${price.toLocaleString()}원`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </InfoCard>
            <InfoCard
              icon={<Sparkles />}
              title="공간 특징"
              items={detail.features}
            />
            <InfoCard icon={<Building2 />} title="층" items={detail.floors} />
            <InfoCard icon={<Rows3 />} title="좌석" items={detail.seating} />
            <InfoCard icon={<Car />} title="주차" items={detail.parking} />
            <InfoCard icon={<Eye />} title="전망" items={detail.view} />
            <InfoCard
              icon={<Users />}
              title="추천 목적"
              items={detail.purpose}
            />
            <InfoCard
              icon={<Baby />}
              title="아이 동반"
              items={detail.children}
            />
            <InfoCard
              icon={<BookOpenCheck />}
              title="스터디"
              items={detail.study}
            />
            <InfoCard icon={<PawPrint />} title="반려동물" items={detail.pet} />
            <InfoCard
              icon={<Cigarette />}
              title="흡연"
              items={detail.smoking}
            />
            <InfoCard
              icon={<Toilet />}
              title="화장실"
              items={detail.restroom}
            />
          </div>
        </section>

        <section className="mt-16 sm:mt-24">
          <SectionHeading eyebrow="Location">
            카페는 어디에 있을까요?
          </SectionHeading>
          <div className="mt-8 overflow-hidden rounded-3xl border-2 border-bark bg-white">
            <div className="flex flex-col gap-3 border-b-2 border-bark p-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <p className="flex items-start gap-2 text-sm font-bold sm:text-base">
                <MapPin className="mt-0.5 size-4 shrink-0 text-autumn" />
                {cafe.location.address}
              </p>
              <div className="flex shrink-0 gap-2">
                <Button
                  render={
                    <a
                      href={naverMapUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="네이버 지도에서 보기 (새 창)"
                    />
                  }
                  nativeButton={false}
                  variant="seed"
                  className="bg-[#44ba5b] text-white hover:bg-[#3a9e4d]"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="-3 -3 30 30"
                    className="size-4"
                  >
                    <path
                      fill="currentColor"
                      d="M16.273 12.845 7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845Z"
                    />
                  </svg>
                  네이버 지도
                </Button>
                <Button
                  render={
                    <a
                      href={kakaoMapUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="카카오 지도에서 보기 (새 창)"
                    />
                  }
                  nativeButton={false}
                  variant="seed"
                  className="bg-[#fee500] text-bark hover:bg-[#f4dc00]"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="size-4"
                  >
                    <path
                      fill="currentColor"
                      d="M12 3C6.48 3 2 6.5 2 10.82c0 2.76 1.83 5.18 4.59 6.57l-.93 3.42a.38.38 0 0 0 .58.42l4.08-2.7c.55.07 1.11.11 1.68.11 5.52 0 10-3.5 10-7.82S17.52 3 12 3Z"
                    />
                  </svg>
                  카카오 지도
                </Button>
              </div>
            </div>
            <CafeLocationMap
              slug={slug}
              name={cafe.name}
              naverRating={naver?.rating ?? null}
              latitude={cafe.location.latitude}
              longitude={cafe.location.longitude}
            />
          </div>
        </section>

        {gallery.length > 0 && (
          <section className="mt-16 sm:mt-24">
            <SectionHeading eyebrow="Gallery">
              어떤 공간인지 함께 둘러봐요!
            </SectionHeading>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {gallery.map((path, index) => (
                <DetailGalleryImage
                  key={path}
                  src={getImageUrl(path)}
                  alt={`${cafe.name}(${regionLabel}) 공간 사진 ${index + 1}`}
                />
              ))}
            </div>
          </section>
        )}

        <section className="mt-16 sm:mt-24">
          <SectionHeading eyebrow="Explore">
            이런 카페도 좋아할 거예요!
          </SectionHeading>
          <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {relatedCafes.map(({ cafe: relatedCafe }) => (
              <CafeCard
                key={relatedCafe.slug}
                heading="h3"
                slug={relatedCafe.slug}
                name={relatedCafe.name}
                types={relatedCafe.type}
                address={relatedCafe.location.address}
                latitude={relatedCafe.location.latitude}
                longitude={relatedCafe.location.longitude}
                description={relatedCafe.description}
                image={getCafeImage(relatedCafe.slug)}
                naverRating={
                  getLatestRating(relatedCafe.ratings, "naver")?.rating ?? null
                }
                href={`/cafe/${relatedCafe.slug}`}
                className="shadow-none"
              />
            ))}
          </ul>
        </section>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-2 pb-20 sm:px-8">
        <SectionHeading eyebrow="Notice">카페조아 이용 안내</SectionHeading>
        <ul className="mt-8 list-disc space-y-4 pl-3 text-sm leading-7 text-[#795f55] marker:text-autumn sm:text-[15px]">
          {cafeInfoNotices.map(({ title, text }) => (
            <li key={title}>
              <strong className="block text-bark">{title}</strong>
              {text}
            </li>
          ))}
          <li>
            <strong className="block text-bark">더 자세히 확인하기</strong>
            자세한 내용은{" "}
            <Link
              href="/terms"
              className="font-bold text-bark underline-offset-4 hover:text-autumn hover:underline"
            >
              이용약관 제8조
            </Link>
            에서 확인할 수 있습니다.
          </li>
        </ul>
      </div>
    </main>
  );
}

function SectionHeading({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-extrabold tracking-[0.18em] text-autumn uppercase">
        {eyebrow}
      </p>
      <h2 className="font-paperlogy mt-2 text-3xl font-semibold sm:text-4xl">
        {children}
      </h2>
    </div>
  );
}

function RatingBox({
  label,
  rating,
}: {
  label: string;
  rating: LatestRating | null;
}) {
  return (
    <div className="rounded-2xl bg-cream p-4">
      <p className="text-xs font-bold text-[#9c8578]">{label}</p>
      {rating ? (
        <>
          <p className="mt-1 flex items-center gap-1 text-xl font-extrabold">
            <Star className="size-4 fill-autumn text-autumn" />
            {rating.rating.toFixed(2)}
          </p>
          <p className="mt-1 text-[12px] leading-5 text-[#5a4031]">
            리뷰 {rating.count.toLocaleString()} <br /> {rating.month} 기준
          </p>
        </>
      ) : (
        <p className="mt-2 text-sm text-[#9c8578]">정보 없음</p>
      )}
    </div>
  );
}

function ContactLink({
  href,
  icon,
  external,
  children,
}: {
  href: string;
  icon: ReactNode;
  external?: boolean;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="flex items-center gap-2 font-bold hover:text-autumn"
    >
      <span className="[&_svg]:size-4 [&_svg]:text-autumn">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {external ? (
        <ExternalLink className="size-3.5" />
      ) : (
        <ChevronRight className="size-4" />
      )}
    </a>
  );
}

function InfoCard({
  icon,
  title,
  items,
  children,
}: {
  icon: ReactNode;
  title: string;
  items?: string[];
  children?: ReactNode;
}) {
  return (
    <article className="rounded-3xl border-2 border-bark bg-white p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-leaf [&_svg]:size-5">
          {icon}
        </span>
        <h3 className="font-paperlogy text-lg font-semibold">{title}</h3>
      </div>
      <div className="mt-5 text-sm leading-6 text-[#795f55]">
        {children ?? <TagList items={items ?? []} />}
      </div>
    </article>
  );
}

function TagList({ items }: { items: string[] }) {
  return items.length ? (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="rounded-full bg-cream px-3 py-1 font-bold">
          {item}
        </span>
      ))}
    </div>
  ) : (
    <p>정보 없음</p>
  );
}
