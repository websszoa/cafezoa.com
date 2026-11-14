import { getCafeCoverUrl } from "@/lib/cafe-images";
import { getLatestRating } from "@/lib/ratings";
import {
  TasteFinder,
  type TasteCafe,
  type TasteGroup,
  type TasteKey,
} from "@/components/page/page-taste-prop";

import cafes from "@/data/cafe-basic.json";
import cafeDetails from "@/data/cafe-details.json";

type CafeDetail = {
  view?: string[];
  services?: string[];
  purpose?: string[];
  features?: string[];
  parking?: string[];
  pet?: string[];
  study?: string[];
  smoking?: string[];
};

const detailsBySlug = cafeDetails as Record<string, CafeDetail | undefined>;

// 주차·반려동물·공부·흡연은 값이 제각각이라 고르기 쉬운 이름으로 바꾼다. (각 항목의 첫 값 기준)
function parkingTags(parking: string[] = []) {
  if (parking[0] === "무료") return ["무료"];
  if (parking[0] === "유료") return ["유료"];
  return [];
}

// 첫 값: 가능 / 일부 구역 가능 / 야외만 가능 / 불가 (README 반려동물 기준)
const PET_LABELS: Record<string, string> = {
  가능: "동반 가능",
  "일부 구역 가능": "일부 구역 가능",
  "야외만 가능": "야외만 가능",
  불가: "동반 불가",
};

function petTags(pet: string[] = []) {
  const label = PET_LABELS[pet[0] ?? ""];
  return label ? [label] : [];
}

// "장시간 … 비추"가 없으면 오래 머물러도 괜찮은 곳으로 본다.
function studyTags(study: string[] = []) {
  const tags: string[] = [];
  if (!study.some((item) => item.includes("비추"))) {
    tags.push("장시간 이용 가능");
  }
  if (study.includes("콘센트 있음")) tags.push("콘센트 있음");
  return tags;
}

function smokingTags(smoking: string[] = []) {
  if (smoking[0] === "가능") return ["흡연 가능"];
  if (smoking[0] === "불가") return ["흡연 불가"];
  return [];
}

// 상세 정보가 있는 카페만 고를 수 있다. (유형은 basic, 나머지는 details)
const tasteCafes: TasteCafe[] = cafes.flatMap((cafe) => {
  const detail = detailsBySlug[cafe.slug];
  if (!detail) return [];

  return [
    {
      card: {
        slug: cafe.slug,
        name: cafe.name,
        types: cafe.type,
        address: cafe.location.address,
        latitude: cafe.location.latitude,
        longitude: cafe.location.longitude,
        description: cafe.description,
        image: getCafeCoverUrl(cafe.slug),
        naverRating: getLatestRating(cafe.slug, "naver")?.rating ?? null,
        href: `/cafe/${cafe.slug}`,
      },
      tags: {
        types: cafe.type,
        view: detail.view ?? [],
        services: detail.services ?? [],
        purpose: detail.purpose ?? [],
        features: detail.features ?? [],
        parking: parkingTags(detail.parking),
        pet: petTags(detail.pet),
        study: studyTags(detail.study),
        smoking: smokingTags(detail.smoking),
      },
    },
  ];
});

// 많이 쓰인 항목부터. 모든 카페에 있는 항목(예: 서비스 "카페")은 고르는 의미가 없어 뺀다.
// minCount: 이보다 적은 카페에만 있는 항목은 뺀다. (공간 특징은 카페 고유 내용이 많아 2곳 이상만)
function optionsOf(key: TasteKey, minCount = 1) {
  const counts = new Map<string, number>();
  for (const cafe of tasteCafes) {
    for (const value of cafe.tags[key]) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return [...counts]
    .filter(([, count]) => count >= minCount && count < tasteCafes.length)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko"))
    .map(([value]) => value);
}

const groups: TasteGroup[] = [
  { key: "types", title: "유형", options: optionsOf("types") },
  { key: "view", title: "뷰", options: optionsOf("view") },
  { key: "services", title: "서비스", options: optionsOf("services") },
  { key: "purpose", title: "추천 목적", options: optionsOf("purpose") },
  { key: "features", title: "공간 특징", options: optionsOf("features", 2) },
  { key: "parking", title: "주차", options: optionsOf("parking") },
  { key: "pet", title: "반려동물", options: optionsOf("pet") },
  { key: "study", title: "공부", options: optionsOf("study") },
  { key: "smoking", title: "흡연", options: optionsOf("smoking") },
];

export function PageTaste() {
  return (
    <div className="bg-autumn border-t border-b border-[#ead9ca]/30">
      {/* 카드 페이지처럼 폭 제한 없이, 380px 칸을 들어가는 만큼 가운데 정렬한다. (page-taste-prop.tsx) */}
      <main className="px-5 py-14 sm:px-8 sm:py-16">
        <TasteFinder cafes={tasteCafes} groups={groups} />
      </main>
    </div>
  );
}
