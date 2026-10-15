import cafeBasicData from "@/data/cafe-basic.json";
import cafeDetailsData from "@/data/cafe-details.json";
import cafeReviewsData from "@/data/cafe-reviews.json";

export { cn } from "cn";

// -----------------------------------------------------------------------------
// 카페 원본 데이터 타입
// -----------------------------------------------------------------------------

interface CafeBasic {
  name: string;
  slug: string;
  description: string;
  type: string[];
  location: {
    country: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  ratings?: Record<string, MonthlyRatings>;
}

interface CafeDetail {
  features?: string[];
  purpose?: string[];
  floors?: string[];
  parking?: string[];
  pet?: string[];
  restroom?: string[];
  children?: string[];
  services?: string[];
  study?: string[];
  smoking?: string[];
  view?: string[];
  seating?: string[];
  business?: {
    opened_at?: string;
    closed_days: string;
    hours: Record<string, string>;
  };
  price?: Record<string, number | null>;
  media?: {
    phone?: string;
    website?: string | null;
    instagram?: string;
    gallery?: string[];
  };
}

export type RatingEntry = [string, number, number];

type MonthlyRatingEntry = [number, number];

interface MonthlyRatings {
  naver?: MonthlyRatingEntry;
  google?: MonthlyRatingEntry;
}

export interface CafeReviewItem {
  text: string;
  tags: string[];
  source_ids: string[];
}

export interface CafeReviews {
  updated_at: string;
  good: CafeReviewItem[];
  bad: CafeReviewItem[];
  sources: Record<string, { label: string; url: string }>;
}

const cafeBasic = cafeBasicData as CafeBasic[];
const cafeDetails = cafeDetailsData as unknown as Record<string, CafeDetail>;
const cafeReviews = cafeReviewsData as unknown as Record<string, CafeReviews>;

// -----------------------------------------------------------------------------
// 카페 데이터 정규화 유틸
// -----------------------------------------------------------------------------

// "대형카페"와 "대형 카페"처럼 공백만 다른 카테고리는 하나로 통합한다.
const typeLabels = new Map<string, string>();

function canonicalType(type: string) {
  const key = type.replace(/\s+/g, "");
  const existing = typeLabels.get(key);
  if (existing) return existing;
  typeLabels.set(key, type);
  return type;
}

function provinceOf(address: string) {
  return address.split(" ")[0] ?? "";
}

function latestRatingOf(
  ratings: Record<string, MonthlyRatings> | undefined,
  source: keyof MonthlyRatings,
): RatingEntry | undefined {
  if (!ratings) return undefined;

  const month = Object.keys(ratings)
    .filter((key) => ratings[key]?.[source] !== undefined)
    .sort()
    .at(-1);
  if (!month) return undefined;

  const rating = ratings[month]?.[source];
  return rating ? [month, rating[0], rating[1]] : undefined;
}

// 일부 원본 경로의 /cafe 접두사가 빠져 있어 파일명 기준으로 경로를 통일한다.
function galleryImagesOf(paths: string[] | undefined, thumbnail: string) {
  const normalizedPaths = (paths ?? []).map(
    (path) => `/cafe/${path.split("/").pop()}`,
  );

  return Array.from(new Set(normalizedPaths)).filter(
    (path) => path !== thumbnail,
  );
}

// -----------------------------------------------------------------------------
// 영업시간 표시 유틸
// -----------------------------------------------------------------------------

const weekdays = [
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
  "일요일",
] as const;

// 연속된 요일은 "월~목"으로 줄이고, 떨어진 요일은 "·"로 연결한다.
function compactDayRanges(dayIndexes: number[]) {
  const ranges: string[] = [];
  let rangeStart = dayIndexes[0];

  dayIndexes.forEach((dayIndex, index) => {
    const nextDayIndex = dayIndexes[index + 1];
    if (nextDayIndex === dayIndex + 1) return;

    const start = weekdays[rangeStart].replace("요일", "");
    const end = weekdays[dayIndex].replace("요일", "");
    ranges.push(start === end ? start : `${start}~${end}`);
    rangeStart = nextDayIndex;
  });

  return ranges.join("·");
}

// 휴무 정보 한 줄을 더했을 때 전체가 3줄이 되도록 영업시간을 두 줄로 요약한다.
function businessHoursLinesOf(hours: Record<string, string> | undefined) {
  if (!hours) return ["영업시간", "정보 없음"];

  const hoursGroups = new Map<string, number[]>();
  weekdays.forEach((day, index) => {
    const businessHours = hours[day] ?? "정보 없음";
    const dayIndexes = hoursGroups.get(businessHours) ?? [];
    dayIndexes.push(index);
    hoursGroups.set(businessHours, dayIndexes);
  });

  if (hoursGroups.size === 1) {
    return ["월요일 ~ 일요일", hours["월요일"] ?? "정보 없음"];
  }

  const lines = Array.from(hoursGroups, ([businessHours, dayIndexes]) =>
    `${compactDayRanges(dayIndexes)} ${businessHours}`,
  );

  return lines.length <= 2 ? lines : [lines[0], lines.slice(1).join(" / ")];
}

// 오픈 날짜의 정밀도(일/월/년)에 맞춰 운영 기간을 표시한다.
function operatingPeriodLabelOf(openedAt: string | undefined) {
  if (!openedAt) return undefined;

  const match = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(openedAt);
  if (!match) return undefined;

  const openedYear = Number(match[1]);
  const openedMonth = match[2] ? Number(match[2]) : undefined;
  const openedDay = match[3] ? Number(match[3]) : undefined;
  const todayParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const todayPart = (type: Intl.DateTimeFormatPartTypes) =>
    Number(todayParts.find((part) => part.type === type)?.value);
  const todayYear = todayPart("year");
  const todayMonth = todayPart("month");
  const todayDay = todayPart("day");

  if (openedMonth && openedDay) {
    const openedDate = Date.UTC(openedYear, openedMonth - 1, openedDay);
    const todayDate = Date.UTC(todayYear, todayMonth - 1, todayDay);
    const days = Math.floor((todayDate - openedDate) / 86_400_000) + 1;
    return days > 0 ? `${days.toLocaleString("ko-KR")}일째 오픈 중` : undefined;
  }

  if (openedMonth) {
    const months =
      (todayYear - openedYear) * 12 + (todayMonth - openedMonth) + 1;
    return months > 0 ? `${months.toLocaleString("ko-KR")}개월째 운영 중` : undefined;
  }

  const years = todayYear - openedYear + 1;
  return years > 0 ? `${years.toLocaleString("ko-KR")}년째 운영 중` : undefined;
}

// -----------------------------------------------------------------------------
// 화면에서 사용하는 카페 데이터
// -----------------------------------------------------------------------------

export const cafes = cafeBasic.map((cafe) => {
  const detail = cafeDetails[cafe.slug];
  const thumbnail = `/cafe/${cafe.slug}-01.webp`;
  const naver = latestRatingOf(cafe.ratings, "naver");
  const google = latestRatingOf(cafe.ratings, "google");

  return {
    ...cafe,
    type: Array.from(new Set(cafe.type.map(canonicalType))),
    province: provinceOf(cafe.location.address),
    // 각 카페의 01번 이미지를 목록과 카드의 대표 이미지로 사용한다.
    thumbnail,
    naver,
    google,
    businessHoursLines: businessHoursLinesOf(detail?.business?.hours),
    businessHours: detail?.business?.hours ?? {},
    closedDays: detail?.business?.closed_days,
    operatingPeriodLabel: operatingPeriodLabelOf(detail?.business?.opened_at),
    isParkingFree: detail?.parking?.includes("무료") ?? false,
    isPetFriendly: detail?.pet?.some((item) => item.includes("가능")) ?? false,
    parkingLabels: detail?.parking,
    studyLabel: detail?.study?.[0],
    petLabel: detail?.pet?.some((item) => item.includes("가능"))
      ? "가능"
      : "불가",
    smokingLabel: detail?.smoking?.[0],
    serviceLabels: detail?.services,
    purposeLabels: detail?.purpose ?? [],
    features: detail?.features ?? [],
    floorLabels: detail?.floors ?? [],
    restroomLabels: detail?.restroom ?? [],
    childrenLabels: detail?.children ?? [],
    galleryImages: galleryImagesOf(detail?.media?.gallery, thumbnail),
    viewLabels: detail?.view,
    seatingLabels: detail?.seating,
    studyLabels: detail?.study ?? [],
    smokingLabels: detail?.smoking ?? [],
    petLabels: detail?.pet ?? [],
    prices: detail?.price ?? {},
    phone: detail?.media?.phone,
    website: detail?.media?.website,
    instagram: detail?.media?.instagram,
    reviews: cafeReviews[cafe.slug],
  };
});

export type Cafe = (typeof cafes)[number];

export const cafeTypes = Array.from(
  new Set(cafes.flatMap((cafe) => cafe.type)),
).sort();

export const cafeProvinces = Array.from(
  new Set(cafes.map((cafe) => cafe.province)),
).sort();
