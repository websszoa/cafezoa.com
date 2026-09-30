export const VIEW_TYPES = [
  "실내뷰",
  "뷰 없음",
  "오션뷰",
  "리버뷰",
  "호수",
  "숲·정원",
  "논밭",
  "시티뷰",
] as const;

export type ViewType = (typeof VIEW_TYPES)[number];

export const KIDS_POLICIES = [
  { value: "all", label: "전체" },
  { value: "no-kids", label: "노키즈존" },
  { value: "yes-kids", label: "예스키즈존" },
] as const;

export type KidsPolicy = (typeof KIDS_POLICIES)[number]["value"];

export const PET_FRIENDLY_OPTIONS = [
  { value: "indoor", label: "반려동반(실내)" },
  { value: "outdoor", label: "반려동반(야외)" },
] as const;

export type PetFriendly = (typeof PET_FRIENDLY_OPTIONS)[number]["value"];

export const SEAT_SIZES = [
  { value: "all", label: "전체" },
  { value: "small", label: "소규모" },
  { value: "medium", label: "중규모" },
  { value: "large", label: "대규모" },
] as const;

export type SeatSize = (typeof SEAT_SIZES)[number]["value"];

export const AMENITIES = [
  { value: "freeParking", label: "무료주차" },
  { value: "rooftop", label: "루프탑" },
  { value: "bakery", label: "베이커리" },
] as const;

export type Amenity = (typeof AMENITIES)[number]["value"];

export const VISIT_TIPS = [
  { value: "lowWaiting", label: "웨이팅 적음" },
  { value: "photoSpot", label: "포토스팟" },
] as const;

export type VisitTip = (typeof VISIT_TIPS)[number]["value"];

export const REGIONS = [
  { value: "gyeonggi", label: "경기", detail: "가평·양평·파주·김포" },
  { value: "incheon", label: "인천·강화" },
  { value: "gangwon", label: "강원", detail: "강릉·속초" },
  { value: "busan", label: "부산·기장" },
  { value: "jeju", label: "제주" },
] as const;

export type Region = (typeof REGIONS)[number]["value"];

export function getRegionLabel(region: Region): string {
  return REGIONS.find((item) => item.value === region)?.label ?? region;
}

export const THEME_COLLECTIONS = [
  { id: "west-sea-ocean-view", title: "서해 오션뷰 대형카페 TOP10", count: 10 },
  { id: "pet-friendly-garden", title: "반려견과 가기 좋은 정원 카페", count: 8 },
  { id: "gapyeong-riverview", title: "가평 리버뷰 베이커리 카페", count: 6 },
  { id: "jeju-photo-spot", title: "제주 포토스팟 맛집 카페", count: 9 },
] as const;
