import type {
  Amenity,
  KidsPolicy,
  PetFriendly,
  Region,
  SeatSize,
  ViewType,
  VisitTip,
} from "./filters";
import cafeData from "@/data/cafe.json";

export type Cafe = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  region: Region;
  viewType: ViewType;
  seatSize: Exclude<SeatSize, "all">;
  kidsPolicy: Exclude<KidsPolicy, "all">;
  petFriendly: PetFriendly[];
  amenities: Amenity[];
  visitTips: VisitTip[];
  description: string;
  tags: string[];
  openingHours: string;
  rating: number;
  reviewCount: number;
  phone: string;
  website: string | null;
  instagram: string | null;
  parking: string;
  views: string[];
  floors: string[];
  seating: string[];
  study: string[];
  restroom: string[];
  children: string[];
  smoking: string[];
  services: string[];
  purposes: string[];
  features: string[];
  ratings: {
    source: "네이버" | "구글";
    rating: number;
    reviewCount: number;
    date: string;
  }[];
  images: {
    cover: string | null;
    gallery: string[];
  };
};

type CafeData = (typeof cafeData)[number];

const regionMap: Record<string, Region> = {
  경기: "gyeonggi",
  인천: "incheon",
  강원: "gangwon",
  부산: "busan",
  제주: "jeju",
};

function toCafe(cafe: CafeData): Cafe {
  const rating = cafe.ratings.naver[0] ?? cafe.ratings.google[0];
  const rawView = cafe.space.view[0] ?? "뷰 없음";
  const images = cafe.images.gallery.map((image) =>
    image.startsWith("/cafe/") ? image : `/cafe${image}`,
  );
  const viewType = getViewType(cafe.space.view, rawView);

  return {
    id: cafe.slug,
    name: cafe.name,
    description: cafe.description,
    address: cafe.location.address,
    latitude: cafe.location.latitude,
    longitude: cafe.location.longitude,
    region: regionMap[cafe.location.region] ?? "gyeonggi",
    viewType,
    seatSize: cafe.type.some(
      (type) => type.replaceAll(" ", "") === "대형카페",
    )
      ? "large"
      : "medium",
    kidsPolicy: cafe.purpose.includes("가족") ? "yes-kids" : "no-kids",
    petFriendly: [],
    amenities: [
      ...(cafe.parking.fee === "무료"
        ? (["freeParking"] as Amenity[])
        : []),
      ...(cafe.services.includes("베이커리")
        ? (["bakery"] as Amenity[])
        : []),
      ...(cafe.space.features.some((feature) => feature.includes("루프탑"))
        ? (["rooftop"] as Amenity[])
        : []),
    ],
    visitTips:
      cafe.space.features.includes("포토존") ||
      cafe.services.includes("포토존")
        ? ["photoSpot"]
        : [],
    tags: [...cafe.type, ...cafe.services].slice(0, 3),
    openingHours: `${cafe.business.closed_days === null ? "연중무휴 · " : ""}${cafe.business.opening_time} – ${cafe.business.closing_time}`,
    rating: rating?.rating ?? 0,
    reviewCount: rating?.review_count ?? 0,
    phone: cafe.business.phone,
    website: cafe.links.website,
    instagram: cafe.links.instagram
      ? cafe.links.instagram.startsWith("http")
        ? cafe.links.instagram
        : `https://www.instagram.com/${cafe.links.instagram.replace(/^@/, "")}`
      : null,
    parking: [cafe.parking.fee, cafe.parking.type, formatParkingCapacity(cafe)]
      .filter(Boolean)
      .join(" · "),
    views: cafe.space.view,
    floors: cafe.space.floors,
    seating: cafe.space.seating,
    study: cafe.space.stydy,
    restroom: cafe.space.restroom,
    children: cafe.space.children,
    smoking: cafe.space.smoking,
    services: cafe.services,
    purposes: cafe.purpose,
    features: cafe.space.features,
    ratings: [
      ...cafe.ratings.naver.map((item) => ({
        source: "네이버" as const,
        rating: item.rating,
        reviewCount: item.review_count,
        date: item.date,
      })),
      ...cafe.ratings.google.map((item) => ({
        source: "구글" as const,
        rating: item.rating,
        reviewCount: item.review_count,
        date: item.date,
      })),
    ],
    images: {
      cover: images[0] ?? null,
      gallery: images.slice(1),
    },
  };
}

function getViewType(views: string[], rawView: string): ViewType {
  if (views.some((view) => /바다|해안|항구/.test(view))) return "오션뷰";
  if (views.some((view) => view.includes("강뷰"))) return "리버뷰";
  if (views.some((view) => /호수|저수지/.test(view))) return "호수";
  if (views.some((view) => /숲|정원|식물원|공원/.test(view))) return "숲·정원";
  if (views.some((view) => view.includes("논밭"))) return "논밭";
  if (views.some((view) => /도심|거리|야경/.test(view))) return "시티뷰";
  if (rawView === "실내뷰") return "실내뷰";
  return "뷰 없음";
}

function formatParkingCapacity(cafe: CafeData) {
  const { capacity_min: min, capacity_max: max } = cafe.parking;

  if (min && max) return min === max ? `약 ${max}대` : `약 ${min}~${max}대`;
  if (max) return `최대 ${max}대`;
  if (min) return `최소 ${min}대`;
  return null;
}

export const CAFES: Cafe[] = cafeData.map(toCafe);

export type CafeFilters = {
  query: string;
  region: Region | "all";
  viewTypes: ViewType[];
  kidsPolicy: KidsPolicy;
  petFriendly: PetFriendly[];
  seatSize: SeatSize;
  amenities: Amenity[];
  visitTips: VisitTip[];
};

export const DEFAULT_CAFE_FILTERS: CafeFilters = {
  query: "",
  region: "all",
  viewTypes: [],
  kidsPolicy: "all",
  petFriendly: [],
  seatSize: "all",
  amenities: [],
  visitTips: [],
};

export function filterCafes(cafes: Cafe[], filters: CafeFilters): Cafe[] {
  const query = filters.query.trim().toLowerCase();

  return cafes.filter((cafe) => {
    if (filters.region !== "all" && cafe.region !== filters.region) return false;
    if (
      filters.viewTypes.length > 0 &&
      !filters.viewTypes.includes(cafe.viewType)
    )
      return false;
    if (filters.kidsPolicy !== "all" && cafe.kidsPolicy !== filters.kidsPolicy)
      return false;
    if (filters.seatSize !== "all" && cafe.seatSize !== filters.seatSize)
      return false;
    if (
      filters.petFriendly.length > 0 &&
      !filters.petFriendly.every((option) => cafe.petFriendly.includes(option))
    )
      return false;
    if (
      filters.amenities.length > 0 &&
      !filters.amenities.every((option) => cafe.amenities.includes(option))
    )
      return false;
    if (
      filters.visitTips.length > 0 &&
      !filters.visitTips.every((option) => cafe.visitTips.includes(option))
    )
      return false;
    if (query) {
      const haystack = `${cafe.name} ${cafe.address}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}
