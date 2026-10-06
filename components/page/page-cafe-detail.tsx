import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { CafeGallery } from "@/components/cafe/cafe-gallery";
import { CafeLocationMap } from "@/components/cafe/cafe-location-map";
import { PageFooter } from "@/components/page/page-footer";
import {
  ArrowLeft,
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
  Home,
  MapPin,
  Phone,
  ReceiptText,
  Rows3,
  Sparkles,
  Star,
  Toilet,
  Users,
} from "lucide-react";

import { cafes, type Cafe } from "@/lib/utils";

const priceNames: Record<string, string> = {
  americano: "아메리카노",
  cafelatte: "카페라테",
  croissant: "크루아상",
};

export function CafeDetailPage({ cafe }: { cafe: Cafe }) {
  const gallery = [cafe.thumbnail, ...cafe.galleryImages];
  const relatedCafes = getRelatedCafes(cafe);
  const informationDate = [cafe.naver?.[0], cafe.google?.[0]]
    .filter((date): date is string => Boolean(date))
    .sort()
    .at(-1);
  const instagramUrl = cafe.instagram
    ? `https://www.instagram.com/${cafe.instagram}/`
    : null;
  const mapUrl = `https://map.naver.com/p/search/${encodeURIComponent(cafe.location.address)}`;

  return (
    <main className="min-h-dvh bg-[#fff3e5] text-[#3a241c]">
      <section className="relative isolate min-h-[52vh] overflow-hidden bg-[#3a241c] text-white">
        <Image
          src={cafe.thumbnail}
          alt={`${cafe.name} 대표 전경`}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#3a241c] via-[#3a241c]/85 to-black/55" />

        <div className="relative mx-auto flex min-h-[52vh] max-w-7xl flex-col justify-between px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex items-center justify-between gap-3">
            <Button
              render={<Link href="/blog" />}
              nativeButton={false}
              variant="ghost"
              className="rounded-full border border-white/30 bg-black/20 px-4 text-white backdrop-blur-md hover:bg-white hover:text-[#3a241c]"
            >
              <ArrowLeft />
              카페 목록
            </Button>
            <Button
              render={<Link href="/" />}
              nativeButton={false}
              variant="ghost"
              size="icon"
              aria-label="홈으로"
              className="rounded-full bg-[#9cff75] text-[#3a241c] hover:bg-[#8df267]"
            >
              <Home />
            </Button>
          </div>

          <div className="max-w-7xl pb-8 sm:pb-12">
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
            <p className="mt-5 flex items-start gap-2 text-sm text-white/85 sm:text-base">
              <MapPin className="mt-1 size-4 shrink-0 text-[#9cff75]" />
              {cafe.location.address}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <section>
          <SectionHeading eyebrow="Cafe story">
            이 공간을 소개해요
          </SectionHeading>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem] lg:gap-12">
            <div className="rounded-3xl border-2 border-[#3a241c] bg-white p-6 shadow-[6px_7px_0_#3a241c] sm:p-8">
              <h3 className="font-paperlogy text-2xl text-[#3a241c]">
                {cafe.name}
              </h3>
              <p className="mt-4 text-base leading-8 text-[#795f55] sm:text-lg">
                {cafe.description}
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {cafe.features.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-full border-2 border-[#3a241c] bg-[#9cff75] px-3 py-1.5 text-xs font-bold shadow-[2px_2px_0_#3a241c]"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <aside className="rounded-3xl border-2 border-[#3a241c] bg-white p-6 shadow-[6px_7px_0_#3a241c]">
              <div className="grid grid-cols-2 gap-3">
                <RatingBox label="네이버" rating={cafe.naver} />
                <RatingBox label="Google" rating={cafe.google} />
              </div>
              <div className="mt-6 space-y-3 border-t border-[#ead9ca] pt-5 text-sm">
                {cafe.phone && (
                  <ContactLink href={`tel:${cafe.phone}`} icon={<Phone />}>
                    {cafe.phone}
                  </ContactLink>
                )}
                <ContactLink href={mapUrl} icon={<MapPin />} external>
                  네이버 지도에서 보기
                </ContactLink>
                {cafe.website && (
                  <ContactLink href={cafe.website} icon={<Globe2 />} external>
                    공식 웹사이트
                  </ContactLink>
                )}
                {instagramUrl && (
                  <ContactLink href={instagramUrl} icon={<AtSign />} external>
                    @{cafe.instagram}
                  </ContactLink>
                )}
              </div>
              {informationDate && (
                <p className="mt-5 border-t border-[#ead9ca] pt-4 text-xs leading-5 text-[#9c8578]">
                  정보 기준 {informationDate} · 영업시간과 이용 정보는 방문 전
                  공식 채널에서 다시 확인해 주세요.
                </p>
              )}
            </aside>
          </div>
        </section>

        <section className="mt-16 sm:mt-24">
          <SectionHeading eyebrow="Information">이용 정보</SectionHeading>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <InfoCard icon={<Clock3 />} title="영업시간">
              <div className="space-y-2">
                {Object.entries(cafe.businessHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between gap-4">
                    <span className="text-[#684d3e]">{day}</span>
                    <span className="font-bold">{hours}</span>
                  </div>
                ))}
                <p className="border-t border-[#ead9ca] pt-3 font-bold text-[#ff5b20]">
                  휴무 · {cafe.closedDays ?? "정보 없음"}
                </p>
              </div>
            </InfoCard>
            <InfoCard
              icon={<Coffee />}
              title="메뉴·서비스"
              items={cafe.serviceLabels}
            />
            <InfoCard icon={<Car />} title="주차" items={cafe.parkingLabels} />
            <InfoCard icon={<Rows3 />} title="층·좌석">
              <TagList
                items={[...cafe.floorLabels, ...(cafe.seatingLabels ?? [])]}
              />
            </InfoCard>
            <InfoCard icon={<Eye />} title="전망" items={cafe.viewLabels} />
            <InfoCard
              icon={<Users />}
              title="추천 목적"
              items={cafe.purposeLabels}
            />
            <InfoCard
              icon={<Baby />}
              title="아이 동반"
              items={cafe.childrenLabels}
            />
            <InfoCard
              icon={<BookOpenCheck />}
              title="스터디"
              items={cafe.studyLabels}
            />
            <InfoCard
              icon={<Building2 />}
              title="반려동물"
              items={cafe.petLabels}
            />
            <InfoCard
              icon={<Cigarette />}
              title="흡연"
              items={cafe.smokingLabels}
            />
            <InfoCard
              icon={<Toilet />}
              title="화장실"
              items={cafe.restroomLabels}
            />
            <InfoCard
              icon={<Sparkles />}
              title="공간 특징"
              items={cafe.features}
            />
            {Object.keys(cafe.prices).length > 0 && (
              <InfoCard icon={<ReceiptText />} title="대표 가격">
                <div className="space-y-2">
                  {Object.entries(cafe.prices).map(([menu, price]) => (
                    <div key={menu} className="flex justify-between gap-4">
                      <span>{priceNames[menu] ?? menu}</span>
                      <span className="font-bold">
                        {price.toLocaleString()}원
                      </span>
                    </div>
                  ))}
                </div>
              </InfoCard>
            )}
          </div>
        </section>

        <section className="mt-16 sm:mt-24">
          <SectionHeading eyebrow="Location">카페 위치</SectionHeading>
          <div className="mt-8 overflow-hidden rounded-3xl border-2 border-[#3a241c] bg-white shadow-[6px_7px_0_#3a241c]">
            <div className="flex flex-col gap-3 border-b-2 border-[#3a241c] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <p className="flex items-start gap-2 text-sm font-bold sm:text-base">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[#ff5b20]" />
                {cafe.location.address}
              </p>
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 self-start text-sm font-bold text-[#ff5b20] hover:underline sm:self-auto"
              >
                네이버 지도에서 보기
                <ExternalLink className="size-3.5" />
              </a>
            </div>
            <CafeLocationMap
              name={cafe.name}
              latitude={cafe.location.latitude}
              longitude={cafe.location.longitude}
            />
          </div>
        </section>

        <section className="mt-16 sm:mt-24">
          <SectionHeading eyebrow="Gallery">공간 둘러보기</SectionHeading>
          <CafeGallery cafeName={cafe.name} images={gallery} />
        </section>

        <section className="mt-16 sm:mt-24">
          <SectionHeading eyebrow="Explore">
            이런 카페도 좋아할 거예요
          </SectionHeading>
          <div className="mt-8 grid gap-7 md:grid-cols-3">
            {relatedCafes.map(({ cafe: relatedCafe, distance, sharedTypes }) => (
              <Link
                key={relatedCafe.slug}
                href={`/cafe/${relatedCafe.slug}`}
                className="group overflow-hidden rounded-3xl border-2 border-[#3a241c] bg-white shadow-[6px_7px_0_#3a241c] outline-none focus-visible:ring-4 focus-visible:ring-[#ff5b20]/40"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-stone-200">
                  <Image
                    src={relatedCafe.thumbnail}
                    alt={`${relatedCafe.name} 대표 전경`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                  {relatedCafe.naver && (
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-[#ff5b20] px-3 py-1.5 text-xs font-bold text-white shadow-md">
                      <Star className="size-3 fill-white" />
                      {relatedCafe.naver[1].toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="p-5 sm:p-6">
                  <p className="flex items-center justify-between gap-3 text-xs font-bold text-[#ff5b20]">
                    <span>
                      {sharedTypes.length > 0
                        ? `${sharedTypes.slice(0, 2).join(" · ")} 취향`
                        : "근처 카페"}
                    </span>
                    <span className="text-[#9c8578]">
                      {formatDistance(distance)}
                    </span>
                  </p>
                  <h3 className="font-paperlogy mt-2 text-2xl font-semibold">
                    {relatedCafe.name}
                  </h3>
                  <p className="mt-2 flex items-start gap-1.5 text-sm text-[#795f55]">
                    <MapPin className="mt-0.5 size-3.5 shrink-0 text-[#ff5b20]" />
                    <span className="line-clamp-1">{relatedCafe.location.address}</span>
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[#3a241c] group-hover:text-[#ff5b20]">
                    상세 정보 보기
                    <ChevronRight className="size-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
      <PageFooter />
    </main>
  );
}

function getRelatedCafes(currentCafe: Cafe) {
  return cafes
    .filter((cafe) => cafe.slug !== currentCafe.slug)
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

function distanceBetween(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
) {
  const toRadians = (degree: number) => (degree * Math.PI) / 180;
  const latitudeDifference = toRadians(latitudeB - latitudeA);
  const longitudeDifference = toRadians(longitudeB - longitudeA);
  const originLatitude = toRadians(latitudeA);
  const targetLatitude = toRadians(latitudeB);
  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(targetLatitude) *
      Math.sin(longitudeDifference / 2) ** 2;

  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function formatDistance(distance: number) {
  return distance < 1
    ? `${Math.round(distance * 1000)}m`
    : `${distance.toFixed(1)}km`;
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
      <p className="text-xs font-extrabold tracking-[0.18em] text-[#ff5b20] uppercase">
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
  rating?: [string, number, number];
}) {
  return (
    <div className="rounded-2xl bg-[#fff3e5] p-4">
      <p className="text-xs font-bold text-[#9c8578]">{label}</p>
      {rating ? (
        <>
          <p className="mt-1 flex items-center gap-1 text-xl font-extrabold">
            <Star className="size-4 fill-[#ff5b20] text-[#ff5b20]" />
            {rating[1].toFixed(2)}
          </p>
          <p className="mt-1 text-[12px] leading-5 text-[#5a4031]">
            리뷰 {rating[2].toLocaleString()} <br /> {rating[0]}
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
      className="flex items-center gap-2 font-bold hover:text-[#ff5b20]"
    >
      <span className="[&_svg]:size-4 [&_svg]:text-[#ff5b20]">{icon}</span>
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
    <article className="rounded-3xl border-2 border-[#3a241c] bg-white p-6 shadow-[6px_7px_0_#3a241c]">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-[#9cff75] shadow-[2px_3px_0_#3a241c] [&_svg]:size-5">
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
        <span
          key={item}
          className="rounded-full bg-[#fff3e5] px-3 py-1 font-bold"
        >
          {item}
        </span>
      ))}
    </div>
  ) : (
    <p>정보 없음</p>
  );
}
