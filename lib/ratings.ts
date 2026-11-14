import cafeRatings from "@/data/cafe-ratings.json";

// 카페 평점 (data/cafe-ratings.json)
// 카페 slug별로 수집일마다 평점을 쌓아 둔다. 키는 "YYYY-MM" 또는 "YYYY-MM-DD"이고,
// 각 값은 [평점, 리뷰 수] 형태다.
// 예) "dirty-trunk-paju": { "2026-11": { "naver": [4.3, 31416], "google": [3.9, 5418] } }
export type Ratings = Record<
  string,
  { naver?: number[]; google?: number[] } | undefined
>;

const ratingsBySlug = cafeRatings as Record<string, Ratings | undefined>;

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

// 카페(slug)의 해당 플랫폼 평점 중 가장 최근 기록을 돌려준다. 데이터가 없으면 null.
export function getLatestRating(
  slug: string,
  platform: Platform,
): LatestRating | null {
  const ratings = ratingsBySlug[slug];
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
