"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const ERROR_MESSAGES: Record<string, string> = {
  missing_code: "로그인 요청이 올바르지 않습니다. 다시 시도해주세요.",
  exchange_failed: "로그인에 실패했습니다. 다시 시도해주세요.",
  withdrawn: "탈퇴한 계정입니다. 문의가 필요하면 고객센터로 연락해주세요.",
};

const SUCCESS_MESSAGES: Record<string, string> = {
  new: "가입을 환영합니다!",
  returning: "로그인되었습니다.",
};

export function AuthToast() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("authError");
    const authSuccess = params.get("authSuccess");

    if (authError) {
      toast.error(ERROR_MESSAGES[authError] ?? "로그인 중 문제가 발생했습니다.");
    } else if (authSuccess) {
      toast.success(SUCCESS_MESSAGES[authSuccess] ?? "로그인되었습니다.");
    } else {
      return;
    }

    // 새로고침/뒤로가기 시 토스트가 다시 뜨지 않도록 쿼리를 지운다.
    params.delete("authError");
    params.delete("authSuccess");
    const query = params.toString();
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`,
    );
  }, []);

  return null;
}
