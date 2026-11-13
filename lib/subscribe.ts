// 구독 신청 폼(components/dialog/dialog-subscribe.tsx)의 선택 항목.
// value는 저장용 영문 키, label은 화면 표시용 문구다. (나중에 구독 SQL의 enum과 맞춘다)

// 나이대 (필수, 하나만 선택)
export const subscribeAgeGroups = [
  { value: "20s", label: "20대" },
  { value: "30s", label: "30대" },
  { value: "40s", label: "40대" },
  { value: "50s", label: "50대 이상" },
] as const;

// 카페조아를 알게 된 경로 (필수, 하나만 선택)
export const subscribeSources = [
  { value: "search", label: "검색" },
  { value: "instagram", label: "인스타그램" },
  { value: "blog", label: "블로그" },
  { value: "friend", label: "지인 추천" },
  { value: "etc", label: "기타" },
] as const;

// 좋아하는 카페 스타일 (선택, 여러 개 선택)
export const subscribeStyles = [
  { value: "large", label: "대형 카페" },
  { value: "view", label: "뷰 좋은 카페" },
  { value: "bakery", label: "베이커리 카페" },
  { value: "dessert", label: "디저트 카페" },
  { value: "brunch", label: "브런치 카페" },
  { value: "mood", label: "감성 카페" },
  { value: "nature", label: "자연 속 카페" },
  { value: "unique", label: "이색 카페" },
  { value: "quiet", label: "조용한 카페" },
  { value: "work", label: "작업하기 좋은 카페" },
  { value: "pet", label: "반려동물 동반 카페" },
  { value: "family", label: "아이와 함께 가는 카페" },
  { value: "etc", label: "기타" },
] as const;

// 카페 방문 시 중요하게 생각하는 요소 (선택, 복수 선택)
export const subscribePriorities = [
  { value: "coffee", label: "커피 맛" },
  { value: "dessert", label: "디저트·베이커리" },
  { value: "interior", label: "인테리어·분위기" },
  { value: "view", label: "뷰·풍경" },
  { value: "parking", label: "주차 편의" },
  { value: "seating", label: "넓고 편안한 좌석" },
  { value: "price", label: "합리적인 가격" },
  { value: "clean", label: "청결·위생" },
  { value: "quiet", label: "조용한 분위기" },
  { value: "access", label: "교통·접근성" },
  { value: "wifi", label: "와이파이·콘센트" },
  { value: "pet", label: "반려동물 동반" },
  { value: "kids", label: "아이 동반 편의" },
  { value: "etc", label: "기타" },
] as const;

type OptionValue<T extends readonly { value: string }[]> = T[number]["value"];

export type SubscribeAgeGroup = OptionValue<typeof subscribeAgeGroups>;
export type SubscribeSource = OptionValue<typeof subscribeSources>;
export type SubscribeStyle = OptionValue<typeof subscribeStyles>;
export type SubscribePriority = OptionValue<typeof subscribePriorities>;

// zod enum에 넘길 값 목록
export const subscribeAgeGroupValues = subscribeAgeGroups.map(
  ({ value }) => value,
) as [SubscribeAgeGroup, ...SubscribeAgeGroup[]];
export const subscribeSourceValues = subscribeSources.map(
  ({ value }) => value,
) as [SubscribeSource, ...SubscribeSource[]];
export const subscribePriorityValues = subscribePriorities.map(
  ({ value }) => value,
) as [SubscribePriority, ...SubscribePriority[]];
export const subscribeStyleValues = subscribeStyles.map(
  ({ value }) => value,
) as [SubscribeStyle, ...SubscribeStyle[]];
