```bash
# 1. Next.js 프로젝트 생성
npx create-next-app@latest ./

# 2. Supabase (데이터베이스 & 인증)
npm install @supabase/supabase-js @supabase/ssr

# 3. 폼 처리 & 유효성 검사
npm install react-hook-form zod @hookform/resolvers

# 4. 이메일 발송
npm install resend
```

shadcn/ui 컴포넌트 설치:

```bash
# shadcn/ui 초기화 (최초 1회)
npx shadcn@latest init

# 컴포넌트 추가
npx shadcn@latest add button
npx shadcn@latest add sonner

npx shadcn@latest add sheet
npx shadcn@latest add scroll-area
npx shadcn@latest add separator
npx shadcn@latest add textarea
npx shadcn@latest add input
npx shadcn@latest add badge
npx shadcn@latest add dialog
npx shadcn@latest add checkbox
npx shadcn@latest add sidebar
npx shadcn@latest add input-otp
npx shadcn@latest add table
npx shadcn@latest add avatar
npx shadcn@latest add dropdown-menu
npx shadcn@latest add select
npx shadcn@latest add card
npx shadcn@latest add popover
npx shadcn@latest add tabs
npx shadcn@latest add field
```

---

#type

"대형카페","베이커리카페","식물원카페","소형카페","프랜차이즈","개인카페","복합문화공간"
"창고형","공장형","식물원형","온실형","정원형","한옥형","주택형",
"전통찻집","베이커리카페","브런치카페","디저트카페",
"로스터리카페","스페셜티카페","북카페","갤러리카페","테마카페","키즈카페","반려동물카페",
"오션뷰카페","리버뷰카페","레이크뷰카페","마운틴뷰카페","포레스트뷰카페","루프탑카페",
"드라이브스루카페","무인카페","이색카페"

---

#services

"카페","베이커리","디저트","브런치","식사",
"주류","맥주","와인","칵테일",
"전통차","아이스크림","빙수",
"드라이브스루"

---purpose

"데이트","가족","드라이브","사진","모임",
"산책","휴식","독서","공부","드라이브","여행",
"노트북작업","업무미팅","반려동물동반","일출감상","노을감상","야경감상"

---view

"실내뷰",
"바다뷰","해안도로뷰",
"강뷰","호수뷰","저수지뷰","계곡뷰","산뷰","숲뷰",
"정원뷰","식물원뷰","공원뷰","논밭뷰",
"도심뷰","거리뷰","한옥뷰","항구뷰","다리뷰","공항뷰","일출뷰","노을뷰","야경뷰"

---features

"높은 층고","통창",
"대형 실내공간","창고형 인테리어","공장형 인테리어",
"모던 인테리어","미니멀 인테리어","빈티지 인테리어","레트로 인테리어",
"한옥 인테리어","유럽풍 인테리어",
"플랜테리어","실내정원","독특한 목재 인테리어",
"온실", "중정","루프탑","테라스","발코니","야외정원",
"잔디마당","야외 좌석",
"별관","복층","계단식 좌석",
"포토존","전시공간","독립된 룸",
"단체석","키즈존",
"반려동물 동반 구역","엘리베이터","휠체어 접근 가능"

---seating

"적음","보통","많음","매우 많음",
"50석 미만","50~99석","100~199석","200석 이상","300석 이상",
"공용 테이블",
"바 좌석","창가 좌석","소파 좌석","좌식 좌석",
"계단식 좌석","야외 좌석","등받이 있는 의자",
"넓은 테이블","넓은 테이블 간격","좁은 테이블 간격","창가 좌석 인기"

---stydy

"가능","불가",
"일부 좌석 가능","장시간 이용 비추천",
"노트북 작업하기 좋은 좌석 있음","노트북 사용 제한","노트북 전용 구역 있음",
"콘센트 많음","콘센트 일부 있음","콘센트 없음",
"Wi-Fi 제공","Wi-Fi 없음",
"조용한 편","소음 있는 편","음악 큰 편",
"테이블 높이 적당함","테이블 낮음",

---restroom

"실내","실외",
"별도 건물","건물 공용",
"남녀 구분","남녀 공용",
"층별 화장실","가족 화장실","일부 층에만 있음",
"깨끗함","매우 깨끗함","관리 상태 보통","드러움",
"장애인 화장실 있음",
"기저귀 교환대 있음",
"유아용 변기 있음"

---children

"아이 동반 가능","노키즈존","일부 구역 노키즈존",
"유아의자 있음","유아의자 없음",
"유모차 출입 가능","유모차 이동 불편","유모차 보관공간 있음",
"어린이 메뉴 있음","놀이공간 있음","수유실 있음",
"기저귀 교환대 있음","보호자 동반 필수"
