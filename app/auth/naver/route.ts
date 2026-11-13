import { startNaverLogin } from "@/lib/auth/naver";

// 네이버 로그인 시작 주소. 처리는 lib/auth/naver.ts에서 한다. (예: /auth/naver?next=/card)
export const GET = startNaverLogin;
