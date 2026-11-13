// 화면·메일에서 같이 쓰는 한글 이름표와 표시용 함수.

// 로그인 공급자 → 한글 이름 (네이버는 Supabase 커스텀 공급자라 "custom:naver"로 저장된다)
export const providerLabels: Record<string, string> = {
  google: "구글",
  kakao: "카카오",
  naver: "네이버",
  "custom:naver": "네이버",
};

// 접속 기기 종류 → 한글 이름 (profile_info.device_type)
export const deviceLabels: Record<string, string> = {
  desktop: "PC",
  mobile: "모바일",
  tablet: "태블릿",
};

// 날짜를 한국 시간으로 보기 좋게 바꾼다. 비어 있으면 "-".
// 기본: 2026. 11. 13. 오후 3:20 / short: 26. 11. 13. 오후 3:20
export function formatDate(value: string | null, { short = false } = {}) {
  if (!value) return "-";
  return new Date(value).toLocaleString(
    "ko-KR",
    short
      ? {
          timeZone: "Asia/Seoul",
          year: "2-digit",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }
      : { timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short" },
  );
}

// 비어 있는 값을 빼고 " · "로 잇는다. 모두 비어 있으면 "-".
export function joinValues(values: (string | null | undefined)[]) {
  const filled = values.filter(Boolean);
  return filled.length ? filled.join(" · ") : "-";
}
