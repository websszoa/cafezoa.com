import cafeReviews from "@/data/cafe-reviews.json";

// 카페 후기 요약 (data/cafe-reviews.json)
// 블로그·리뷰 플랫폼의 공개 후기를 좋았던 점 / 아쉬운 점으로 요약하고, 각 문장에 출처(source_ids)를 단다.
// 예) "dirty-trunk-paju": { updated_at, summary?, good: [...], bad: [...], sources: { id: { label, url } } }

export type ReviewPoint = {
  text: string;
  tags: string[];
  // sources의 키
  source_ids: string[];
};

export type ReviewSource = { label: string; url: string };

export type CafeReview = {
  // 후기를 모은 시점 (YYYY-MM)
  updated_at: string;
  // 한 줄 요약 (선택)
  summary?: { good?: string; bad?: string };
  good: ReviewPoint[];
  bad: ReviewPoint[];
  sources: Record<string, ReviewSource>;
};

const reviewsBySlug = cafeReviews as Record<string, CafeReview | undefined>;

// 카페(slug)의 후기 요약. 없으면 null.
export function getCafeReview(slug: string): CafeReview | null {
  const review = reviewsBySlug[slug];
  if (!review || (!review.good.length && !review.bad.length)) return null;
  return review;
}
