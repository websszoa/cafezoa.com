import { ListTable, type ListRow } from "@/components/page/page-list-prop";
import { getCafeCoverUrl } from "@/lib/cafe-images";
import { getLatestRating } from "@/lib/ratings";

import cafes from "@/data/cafe-basic.json";
import cafeDetails from "@/data/cafe-details.json";

// 카페마다 들어 있는 항목이 조금씩 달라서, 모든 항목을 선택값으로 둔다.
type CafeDetail = {
  services?: string[];
  purpose?: string[];
  features?: string[];
  floors?: string[];
  parking?: string[];
  pet?: string[];
  restroom?: string[];
  children?: string[];
  study?: string[];
  smoking?: string[];
  view?: string[];
  seating?: string[];
  business?: { closed_days?: string; hours?: Record<string, string> };
  price?: Record<string, number | null>;
  media: {
    phone?: string | null;
    website?: string | null;
    instagram?: string | null;
  };
};

const WEEK_DAYS = ["월", "화", "수", "목", "금", "토", "일"];

// 요일별 영업시간을 한 줄씩 만든다. (예: "월요일 : 09:30 ~ 21:30")
function getBusinessHoursLines(hours: Record<string, string>) {
  return WEEK_DAYS.flatMap((day) => {
    const time = hours[`${day}요일`];
    return time ? [`${day}요일 : ${time}`] : [];
  });
}

// "가능"이 들어가 있고 "불가"가 아니면 이용 가능한 것으로 본다.
function isAvailable(label: string | undefined) {
  return !!label && label.includes("가능") && !label.includes("불가");
}

// 상세 정보가 있는 카페만 목록으로 보여준다. cafe-details.json의 모든 항목을 표 한 줄 데이터로 만든다.
const listRows: ListRow[] = cafes.flatMap((cafe) => {
  const detail = (cafeDetails as Record<string, CafeDetail>)[cafe.slug];
  if (!detail) return [];

  const ratings = [
    { label: "네이버", rating: getLatestRating(cafe.slug, "naver")?.rating },
    { label: "구글", rating: getLatestRating(cafe.slug, "google")?.rating },
  ].filter(
    (item): item is { label: string; rating: number } =>
      item.rating !== undefined,
  );

  const parking = detail.parking ?? [];
  const study = detail.study ?? [];
  const smoking = detail.smoking ?? [];
  const pet = detail.pet ?? [];

  return [
    {
      slug: cafe.slug,
      name: cafe.name,
      address: cafe.location.address,
      latitude: cafe.location.latitude,
      longitude: cafe.location.longitude,
      image: getCafeCoverUrl(cafe.slug),
      ratings,
      types: cafe.type,
      indicators: [
        {
          key: "parking",
          label: `주차 ${parking[0] || "정보 없음"}`,
          active: parking[0] === "무료",
        },
        {
          key: "study",
          label: `스터디 ${study[0] || "정보 없음"}`,
          active: isAvailable(study[0]),
        },
        {
          key: "smoking",
          label: `흡연 ${smoking[0] || "정보 없음"}`,
          active: isAvailable(smoking[0]),
        },
        {
          key: "pet",
          label: `반려동물 ${pet[0] || "정보 없음"}`,
          active: isAvailable(pet[0]),
        },
      ],
      view: detail.view ?? [],
      services: detail.services ?? [],
      purpose: detail.purpose ?? [],
      features: detail.features ?? [],
      floors: detail.floors ?? [],
      hours: getBusinessHoursLines(detail.business?.hours ?? {}),
      prices: Object.entries(detail.price ?? {}).map(([menu, price]) => ({
        menu,
        price,
      })),
      parking,
      seating: detail.seating ?? [],
      study,
      smoking,
      pet,
      children: detail.children ?? [],
      restroom: detail.restroom ?? [],
      phone: detail.media.phone ?? null,
      website: detail.media.website ?? null,
      instagram: detail.media.instagram ?? null,
    },
  ];
});

export function PageList() {
  return (
    <div className="bg-autumn border-t border-b border-[#ead9ca]/30">
      <main className="px-5 py-12 sm:px-8 sm:py-16">
        <ListTable rows={listRows} />
      </main>
    </div>
  );
}
