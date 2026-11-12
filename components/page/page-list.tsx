import {
  Armchair,
  BookOpenCheck,
  CircleParking,
  Cigarette,
  Clock,
  Coffee,
  Eye,
  MapPin,
  PawPrint,
  Star,
} from "lucide-react";

import Image from "next/image";
import { APP_IMAGE_BASE_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import cafes from "@/data/cafe-basic.json";
import cafeDetails from "@/data/cafe-details.json";

// 월(YYYY-MM)별 평점 기록. 각 값은 [평점, 리뷰 수] 형태이며, 플랫폼마다 기록된 달이 다를 수 있다.
type Ratings = Record<string, { naver?: number[]; google?: number[] }>;

type CafeDetail = (typeof cafeDetails)[keyof typeof cafeDetails];

const WEEK_DAYS = ["월", "화", "수", "목", "금", "토", "일"];

// GitHub Pages에 올라간 카페 대표 이미지 주소. (예: .../public/cafe/{slug}-02.webp)
function getCafeImage(slug: string) {
  return `${APP_IMAGE_BASE_URL}cafe/${slug}-02.webp`;
}

// 네이버 평점이 있는 가장 최근 달의 평점을 돌려준다. 평점 데이터가 없으면 null.
function getLatestNaverRating(ratings: Ratings | undefined) {
  if (!ratings) return null;
  const month = Object.keys(ratings)
    .sort()
    .reverse()
    .find((key) => ratings[key].naver);
  return month ? ratings[month].naver![0] : null;
}

// 요일별 영업시간을 같은 시간끼리 묶어 줄 단위로 만든다. (예: "월~금 10:00 ~ 21:00")
function getBusinessHoursLines(hours: Record<string, string>) {
  const groups: { days: number[]; time: string }[] = [];

  WEEK_DAYS.forEach((day, index) => {
    const time = hours[`${day}요일`];
    if (!time) return;
    const group = groups.find((item) => item.time === time);
    if (group) group.days.push(index);
    else groups.push({ days: [index], time });
  });

  return groups.map(({ days, time }) => {
    if (days.length === WEEK_DAYS.length) return `매일 ${time}`;
    const isRange = days.every((day, i) => i === 0 || day === days[i - 1] + 1);
    const label =
      isRange && days.length > 2
        ? `${WEEK_DAYS[days[0]]}~${WEEK_DAYS[days.at(-1)!]}`
        : days.map((day) => WEEK_DAYS[day]).join("·");
    return `${label} ${time}`;
  });
}

// "가능"이 들어가 있고 "불가"가 아니면 이용 가능한 것으로 본다.
function isAvailable(label: string | undefined) {
  return !!label && label.includes("가능") && !label.includes("불가");
}

// 상세 정보가 있는 카페만 목록으로 보여준다.
const listCafes = cafes.flatMap((cafe) => {
  const detail = (cafeDetails as Record<string, CafeDetail>)[cafe.slug];
  return detail ? [{ ...cafe, detail }] : [];
});

function LabelCell({
  icon: Icon,
  labels,
}: {
  icon: typeof Eye;
  labels: string[];
}) {
  return (
    <td className="font-nanum px-4 py-4 align-top text-sm whitespace-nowrap text-bark">
      <Icon aria-hidden="true" className="mb-2 size-3.5 text-autumn" />
      {labels.length ? (
        <div className="space-y-1">
          {labels.slice(0, 3).map((label) => (
            <p key={label}>{label}</p>
          ))}
        </div>
      ) : (
        "-"
      )}
    </td>
  );
}

export function PageList() {
  return (
    <div className="bg-autumn border-t border-b border-[#ead9ca]/30">
      <main className="mx-auto max-w-[1600px] px-5 py-12 sm:px-8 sm:py-16">
        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_16px_35px_rgba(145,75,0,0.12)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-295 border-collapse text-left text-sm">
              <tbody>
                {listCafes.map((cafe, index) => {
                  const { detail } = cafe;
                  const naverRating = getLatestNaverRating(
                    cafe.ratings as Ratings,
                  );
                  const indicators = [
                    {
                      icon: CircleParking,
                      label: `주차 ${detail.parking[0] || "정보 없음"}`,
                      active: detail.parking[0] === "무료",
                    },
                    {
                      icon: BookOpenCheck,
                      label: `스터디 ${detail.study[0] || "정보 없음"}`,
                      active: isAvailable(detail.study[0]),
                    },
                    {
                      icon: Cigarette,
                      label: `흡연 ${detail.smoking[0] || "정보 없음"}`,
                      active: isAvailable(detail.smoking[0]),
                    },
                    {
                      icon: PawPrint,
                      label: `반려동물 ${detail.pet[0] || "정보 없음"}`,
                      active: isAvailable(detail.pet[0]),
                    },
                  ];

                  return (
                    <tr
                      key={cafe.slug}
                      className={cn(
                        "transition-colors hover:bg-[#fff1da]",
                        index % 2 === 1 && "bg-[#fffaf2]",
                      )}
                    >
                      <td className="hidden px-5 py-4 pr-0 align-middle sm:table-cell">
                        <div className="flex min-w-10 flex-col items-center">
                          <span className="font-nanum text-lg text-[#c3957a]">
                            {index + 1}
                          </span>
                          {naverRating !== null && (
                            <span className="mt-1 inline-flex items-center gap-0.5 text-[12px] font-bold whitespace-nowrap text-[#795f55]">
                              <Star
                                aria-hidden="true"
                                className="size-3 fill-autumn text-autumn"
                              />
                              {naverRating.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded">
                            <Image
                              src={getCafeImage(cafe.slug)}
                              alt={cafe.name}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                            <span className="absolute top-1 left-1 z-10 flex size-5 items-center justify-center rounded-full bg-autumn text-[11px] font-bold text-white sm:hidden">
                              {index + 1}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-paperlogy truncate text-xl font-semibold text-bark">
                              {cafe.name}
                            </p>
                            <p className="mt-0.5 flex items-center gap-1 text-sm whitespace-nowrap text-bark">
                              <MapPin
                                aria-hidden="true"
                                className="size-3.5 shrink-0 text-autumn"
                              />
                              {cafe.location.address}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              {indicators.map(
                                ({ icon: Icon, label, active }) => (
                                  <Icon
                                    key={label}
                                    aria-label={label}
                                    className={cn(
                                      "size-3.5",
                                      active ? "text-autumn" : "text-stone-300",
                                    )}
                                  />
                                ),
                              )}
                            </div>
                            {naverRating !== null && (
                              <span className="mt-2 inline-flex items-center gap-0.5 text-[12px] font-bold whitespace-nowrap text-[#795f55] sm:hidden">
                                <Star
                                  aria-hidden="true"
                                  className="size-3 fill-autumn text-autumn"
                                />
                                {naverRating.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <LabelCell icon={Eye} labels={detail.view} />
                      <LabelCell icon={Coffee} labels={detail.services} />
                      <td className="font-nanum px-4 py-4 align-top text-sm whitespace-nowrap text-bark">
                        <Clock
                          aria-hidden="true"
                          className="mb-2 size-3.5 text-autumn"
                        />
                        <div className="space-y-1">
                          {getBusinessHoursLines(detail.business.hours).map(
                            (line) => (
                              <p key={line}>{line}</p>
                            ),
                          )}
                          <p>{detail.business.closed_days || "정보 없음"}</p>
                        </div>
                      </td>
                      <LabelCell icon={CircleParking} labels={detail.parking} />
                      <LabelCell icon={Armchair} labels={detail.seating} />
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
