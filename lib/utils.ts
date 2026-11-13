export { cn } from "cn";

/* ------------------------------------------------------------------ */
/* 평점 (data/cafe-basic.json 의 ratings)                              */
/* ------------------------------------------------------------------ */

// 수집일별 평점 기록. 키는 "YYYY-MM" 또는 "YYYY-MM-DD"이고, 각 값은 [평점, 리뷰 수] 형태다.
// 카페마다 기록된 날짜가 달라서, 다른 카페에만 있는 날짜는 undefined로 추론된다.
// 예) "2026-11-13": { naver: [4.3, 31416], google: [3.9, 5418] }
export type Ratings = Record<
  string,
  { naver?: number[]; google?: number[] } | undefined
>;

// 평점을 가져오는 플랫폼.
export type Platform = "naver" | "google";

// 가장 최근 평점 기록.
export type LatestRating = {
  // 화면 표시용 기준 월 (YYYY-MM). 수집일의 "일"은 표시하지 않는다.
  month: string;
  // 평점 (예: 4.3)
  rating: number;
  // 리뷰 수 (예: 31416)
  count: number;
};

// 해당 플랫폼 평점이 있는 가장 최근 기록을 돌려준다. 데이터가 없으면 null.
export function getLatestRating(
  ratings: Ratings | undefined,
  platform: Platform,
): LatestRating | null {
  if (!ratings) return null;

  // "YYYY-MM"과 "YYYY-MM-DD"가 섞여 있어도 문자열 정렬로 날짜 순서가 맞는다.
  const date = Object.keys(ratings)
    .sort()
    .reverse()
    .find((key) => ratings[key]?.[platform]);
  const value = date ? ratings[date]?.[platform] : undefined;
  if (!date || !value) return null;

  const [rating, count] = value;
  return { month: date.slice(0, 7), rating, count };
}

/* ------------------------------------------------------------------ */
/* 카페 정보 (SEO 제목·설명 등)                                          */
/* ------------------------------------------------------------------ */

// 구 단위로 나뉘는 광역·특별시. 이 지역의 "OO구"는 구 이름 대신 시 이름을 쓴다.
const METROPOLITAN_CITIES = [
  "서울",
  "부산",
  "대구",
  "인천",
  "광주",
  "대전",
  "울산",
  "세종",
];

// 주소에서 검색에 쓰이는 지역 이름을 뽑는다.
// 예) "경기 파주시 지목로 114" → "파주", "부산 기장군 ..." → "기장", "인천 연수구 ..." → "인천"
export function getCafeRegion(address: string) {
  const [province = "", district = ""] = address.split(" ");
  if (METROPOLITAN_CITIES.includes(province) && district.endsWith("구")) {
    return province;
  }
  return district.replace(/(시|군|구)$/, "") || province;
}

// 카페 유형을 띄어쓰기 없이 맞춘다. 예) "대형 카페" → "대형카페"
export function getCafeTypeLabel(type: string) {
  return type.replace(/\s+/g, "");
}

// 검색 결과에서 잘리지 않도록 소개 글을 문장 단위로 maxLength 이내까지 줄인다.
export function getShortDescription(description: string, maxLength = 150) {
  const sentences = description.match(/[^.!?]+[.!?]?/g) ?? [description];
  let result = "";

  for (const sentence of sentences) {
    const next = `${result} ${sentence.trim()}`.trim();
    if (next.length > maxLength) break;
    result = next;
  }

  // 첫 문장부터 너무 길면 글자 수로 자른다.
  return result || `${description.slice(0, maxLength - 1)}…`;
}

/* ------------------------------------------------------------------ */
/* 거리 (내 위치 ↔ 카페)                                                */
/* ------------------------------------------------------------------ */

// 두 좌표 사이의 거리(km). (하버사인 공식)
export function distanceBetween(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 거리를 화면 표시용 문자열로 바꾼다. 예) 0.35 → "350m", 12.34 → "12.3km", 123.4 → "123km"
export function formatDistance(km: number) {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  if (km < 100) return `${km.toFixed(1)}km`;
  return `${Math.round(km)}km`;
}
