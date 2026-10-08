import { FallbackImage } from "@/components/ui/fallback-image";
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
  Frown,
  Globe2,
  Home,
  MapPin,
  Phone,
  ReceiptText,
  Rows3,
  Smile,
  Sparkles,
  Star,
  Toilet,
  Users,
} from "lucide-react";

import { cafes, type Cafe, type CafeReviews } from "@/lib/utils";

const priceNames: Record<string, string> = {
  americano: "아메리카노",
  cafelatte: "카페라테",
  croissant: "크루아상",
};

export function CafeDetailPage({ cafe }: { cafe: Cafe }) {
  const gallery = [cafe.thumbnail, ...cafe.galleryImages];
  const relatedCafes = getRelatedCafes(cafe);
  const instagramUrl = cafe.instagram
    ? `https://www.instagram.com/${cafe.instagram}/`
    : null;
  const mapUrl = `https://map.naver.com/p/search/${encodeURIComponent(cafe.name)}`;

  return (
    <main className="min-h-dvh bg-[#fff3e5] text-[#3a241c]">
      <section className="relative isolate min-h-[52vh] overflow-hidden bg-[#3a241c] text-white">
        <FallbackImage
          src={cafe.thumbnail}
          alt={`${cafe.name} 대표 전경`}
          fill
          showLoadingAnimation
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#3a241c] via-[#3a241c]/85 to-black/55" />

        <div className="relative mx-auto flex min-h-[52vh] max-w-7xl flex-col justify-between px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex items-center gap-3">
            <Button
              render={<Link href="/blog" />}
              nativeButton={false}
              variant="ghost"
              className="rounded-full border border-white/30 bg-black/20 px-4 text-white backdrop-blur-md hover:bg-white hover:text-[#3a241c]"
            >
              <ArrowLeft />
              카페 목록
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
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <section>
          <SectionHeading eyebrow="Cafe story">
            이 공간을 소개해요
          </SectionHeading>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem]">
            <div className="rounded-3xl border-2 border-[#3a241c] bg-white p-6 sm:p-8">
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
                    className="rounded-full border-2 border-[#3a241c] bg-[#9cff75] px-3 py-1.5 text-xs font-bold"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <aside className="rounded-3xl border-2 border-[#3a241c] bg-white p-6">
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

        {cafe.reviews && (
          <section className="mt-16 sm:mt-24">
            <SectionHeading eyebrow="Reviews">방문자 후기 요약</SectionHeading>
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <ReviewColumn
                title="좋았다는 의견"
                icon={<Smile />}
                items={cafe.reviews.good}
                sources={cafe.reviews.sources}
                accentClassName="bg-[#9cff75]"
              />
              <ReviewColumn
                title="아쉬웠다는 의견"
                icon={<Frown />}
                items={cafe.reviews.bad}
                sources={cafe.reviews.sources}
                accentClassName="bg-[#ffd7c8]"
              />
            </div>
          </section>
        )}

        <section className="mt-16 sm:mt-24">
          <SectionHeading eyebrow="Location">카페 위치</SectionHeading>
          <div className="mt-8 overflow-hidden rounded-3xl border-2 border-[#3a241c] bg-white">
            <div className="flex flex-col gap-3 border-b-2 border-[#3a241c] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <p className="flex items-start gap-2 text-sm font-bold sm:text-base">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[#ff5b20]" />
                {cafe.location.address}
              </p>
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 self-start text-sm font-bold text-[#3a241c] transition-colors hover:text-[#ff5b20] hover:underline sm:self-auto"
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
            {relatedCafes.map(
              ({ cafe: relatedCafe, distance, sharedTypes }) => (
                <Link
                  key={relatedCafe.slug}
                  href={`/cafe/${relatedCafe.slug}`}
                  className="group overflow-hidden rounded-3xl border-2 border-[#3a241c] bg-white outline-none focus-visible:ring-4 focus-visible:ring-[#ff5b20]/40"
                >
                  <div className="relative aspect-4/3 overflow-hidden bg-stone-200">
                    <FallbackImage
                      src={relatedCafe.thumbnail}
                      alt={`${relatedCafe.name} 대표 전경`}
                      fill
                      showLoadingAnimation
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                    {relatedCafe.naver && (
                      <span className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-[#ff5b20] px-3 py-1.5 text-xs font-bold text-white">
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
                      <span className="line-clamp-1">
                        {relatedCafe.location.address}
                      </span>
                    </p>
                    <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[#3a241c] group-hover:text-[#ff5b20]">
                      상세 정보 보기
                      <ChevronRight className="size-4" />
                    </span>
                  </div>
                </Link>
              ),
            )}
          </div>
        </section>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-2 sm:px-8 pb-20">
        <SectionHeading eyebrow="Notice">카페조아 이용 안내</SectionHeading>
        <ul className="mt-8 list-disc space-y-4 pl-3 text-sm leading-7 text-[#795f55] marker:text-[#ff5b20] sm:text-[15px]">
          <li>
            <strong className="block text-[#3a241c]">
              AI를 활용한 정보 수집
            </strong>
            카페 정보는 공식 홈페이지와 공식 소셜 미디어, 지도 서비스 등
            온라인에 공개된 자료를 AI를 활용해 수집하고 항목별로 정리합니다.
            가능한 범위에서 여러 자료를 비교하지만, 자동화된 수집과 정리
            과정에서 일부 정보가 누락되거나 다르게 해석될 수 있습니다.
          </li>
          <li>
            <strong className="block text-[#3a241c]">사진의 출처</strong>
            사진은 카페조아에서 직접 촬영하거나 해당 카페에서 제공받은 이미지를
            사용합니다. 사진은 카페의 외관과 내부 공간, 좌석, 메뉴 등 방문 전에
            공간을 이해하는 데 필요한 정보를 전달하기 위한 목적으로 게시합니다.
          </li>
          <li>
            <strong className="block text-[#3a241c]">사진 보정 및 효과</strong>
            공간의 분위기를 더 잘 전달하기 위해 일부 사진에 밝기·색감 보정이나
            크기 조정, 구도 보완 등의 시각적 효과를 적용할 수 있습니다. 촬영
            시간과 날씨, 계절, 매장 조명에 따라서도 실제 방문 시 보이는 모습과
            차이가 생길 수 있습니다.
          </li>
          <li>
            <strong className="block text-[#3a241c]">평점의 출처</strong>
            평점과 리뷰 수는 네이버와 Google에 공개된 정보를 기준일과 함께
            표시합니다. 카페조아가 자체적으로 평가하거나 두 플랫폼의 점수를
            합산한 결과가 아닙니다. 각 플랫폼의 집계 방식과 정보 수집 시점이
            달라 현재 표시되는 수치와 차이가 있을 수 있습니다.
          </li>
          <li>
            <strong className="block text-[#3a241c]">방문자 후기 요약</strong>
            좋았다는 의견과 아쉬웠다는 의견은 공개된 방문 후기를 주제별로 묶어
            요약한 참고 정보입니다. 특정 후기를 그대로 인용한 평가나 카페조아의
            자체 의견이 아니며, 각 항목의 출처 보기에서 참고한 원문을 확인할 수
            있습니다. 개인의 취향과 방문 날짜, 혼잡도에 따라 경험은 달라질 수
            있습니다.
          </li>
          <li>
            <strong className="block text-[#3a241c]">방문 전 확인</strong>
            영업시간과 휴무일, 메뉴 및 가격, 주차 조건, 반려동물·아이 동반 정책,
            대관 여부는 매장 사정이나 계절에 따라 예고 없이 변경될 수 있습니다.
            중요한 이용 조건은 방문 당일 카페의 공식 채널이나 매장 문의를 통해
            다시 확인해 주세요.
          </li>
          <li>
            <strong className="block text-[#3a241c]">정보 수정 안내</strong>
            잘못 기재된 정보, 운영 변경 사항, 사진 사용과 관련된 요청이 있다면
            카페조아 공식 채널로 알려주세요. 전달받은 내용은 관련 자료를 확인한
            뒤 수정 또는 보완하여 더 정확한 정보를 제공할 수 있도록 관리합니다.
          </li>
        </ul>
      </div>

      <PageFooter />

      <Link
        href="/"
        aria-label="홈으로"
        className="fixed bottom-6 left-5 z-50 grid size-14 place-items-center rounded-full bg-[#9cff75] text-[#3a241c] transition-transform hover:-translate-y-0.5 sm:bottom-8 sm:left-8 sm:size-16"
      >
        <Home className="size-6 sm:size-7" />
      </Link>
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

function ReviewColumn({
  title,
  icon,
  items,
  sources,
  accentClassName,
}: {
  title: string;
  icon: ReactNode;
  items: CafeReviews["good"];
  sources: CafeReviews["sources"];
  accentClassName: string;
}) {
  return (
    <article className="overflow-hidden rounded-3xl border-2 border-[#3a241c] bg-white">
      <div className="flex items-center gap-3 border-b-2 border-[#3a241c] p-5 sm:px-6">
        <span
          className={`grid size-10 place-items-center rounded-full ${accentClassName} [&_svg]:size-5`}
        >
          {icon}
        </span>
        <h3 className="font-paperlogy text-xl font-semibold">{title}</h3>
      </div>
      <ol className="divide-y divide-[#ead9ca] px-5 sm:px-6">
        {items.map((item, index) => (
          <li key={item.text} className="py-6">
            <div className="flex gap-3">
              <span className="font-paperlogy mt-0.5 text-sm font-semibold text-[#ff5b20]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-7 text-[#5a4031] sm:text-base">
                  {item.text}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#fff3e5] px-2.5 py-1 text-[11px] font-bold text-[#795f55]"
                    >
                      #{tag.replace(/\s+/g, "")}
                    </span>
                  ))}
                </div>
                <details className="mt-4 text-xs text-slate-600">
                  <summary className="cursor-pointer font-bold hover:text-[#ff5b20]">
                    출처 {item.source_ids.length}개 보기
                  </summary>
                  <div className="mt-2 flex flex-col items-start gap-2 pl-1">
                    {item.source_ids.map((sourceId) => {
                      const source = sources[sourceId];
                      if (!source) return null;

                      return (
                        <a
                          key={sourceId}
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 hover:text-[#ff5b20] hover:underline underline-offset-4"
                        >
                          {source.label}
                          <ExternalLink className="size-3" />
                        </a>
                      );
                    })}
                  </div>
                </details>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </article>
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
    <article className="rounded-3xl border-2 border-[#3a241c] bg-white p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-[#9cff75] [&_svg]:size-5">
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
