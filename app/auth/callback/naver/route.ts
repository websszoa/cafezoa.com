import { handleNaverCallback } from "@/lib/auth/naver";

// 네이버 로그인이 끝나고 돌아오는 주소. 처리는 lib/auth/naver.ts에서 한다.
export const GET = handleNaverCallback;
