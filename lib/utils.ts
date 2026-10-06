import cafeBasicData from "@/data/cafe-basic.json";
import cafeDetailsData from "@/data/cafe-details.json";
import cafeRatingsData from "@/data/cafe-ratings.json";

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
}

interface CafeDetail {
  features?: string[];
  parking?: string[];
  pet?: string[];
  services?: string[];
  study?: string[];
  smoking?: string[];
  view?: string[];
  seating?: string[];
  business?: {
    closed_days: string;
    hours: Record<string, string>;
  };
  media?: {
    gallery?: string[];
  };
}

export type RatingEntry = [string, number, number];

interface CafeRating {
  naver?: RatingEntry;
  google?: RatingEntry;
}

const cafeBasic = cafeBasicData as CafeBasic[];
const cafeDetails = cafeDetailsData as unknown as Record<string, CafeDetail>;
const cafeRatings = cafeRatingsData as unknown as Record<string, CafeRating>;

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

// 일부 원본 경로의 /cafe 접두사가 빠져 있어 파일명 기준으로 경로를 통일한다.
function galleryImagesOf(paths: string[] | undefined) {
  return (paths ?? []).map((path) => `/cafe/${path.split("/").pop()}`);
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

// -----------------------------------------------------------------------------
// 화면에서 사용하는 카페 데이터
// -----------------------------------------------------------------------------

export const cafes = cafeBasic.map((cafe) => {
  const detail = cafeDetails[cafe.slug];
  const rating = cafeRatings[cafe.slug];

  return {
    ...cafe,
    type: Array.from(new Set(cafe.type.map(canonicalType))),
    province: provinceOf(cafe.location.address),
    // 각 카페의 01번 이미지를 목록과 카드의 대표 이미지로 사용한다.
    thumbnail: `/cafe/${cafe.slug}-01.jpg`,
    naver: rating?.naver,
    google: rating?.google,
    businessHoursLines: businessHoursLinesOf(detail?.business?.hours),
    closedDays: detail?.business?.closed_days,
    isParkingFree: detail?.parking?.includes("무료") ?? false,
    isPetFriendly: detail?.pet?.some((item) => item.includes("가능")) ?? false,
    parkingLabels: detail?.parking,
    studyLabel: detail?.study?.[0],
    petLabel: detail?.pet?.some((item) => item.includes("가능"))
      ? "가능"
      : "불가",
    smokingLabel: detail?.smoking?.[0],
    serviceLabels: detail?.services,
    features: detail?.features ?? [],
    galleryImages: galleryImagesOf(detail?.media?.gallery),
    viewLabels: detail?.view,
    seatingLabels: detail?.seating,
  };
});

export type Cafe = (typeof cafes)[number];

export const cafeTypes = Array.from(
  new Set(cafes.flatMap((cafe) => cafe.type)),
).sort();

export const cafeProvinces = Array.from(
  new Set(cafes.map((cafe) => cafe.province)),
).sort();
