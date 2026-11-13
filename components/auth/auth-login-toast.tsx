"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { providerLabels } from "@/lib/labels";

// 로그인 콜백(lib/auth/oauth-callback.ts, lib/auth/naver.ts)이 붙인 ?login=success / failed / exists를 보고
// 알림(toast)을 띄운 뒤, 새로고침해도 다시 뜨지 않도록 주소에서 지운다.
// (처음 가입한 사용자는 ?welcome=1로 축하 팝업이 뜨므로 이 알림은 뜨지 않는다)
export function AuthLoginToast() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const login = url.searchParams.get("login");
    if (!login) return;

    if (login === "success") toast.success("로그인되었습니다.");
    else if (login === "failed") {
      toast.error("로그인하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } else if (login === "exists") {
      // 같은 이메일로 다른 소셜 로그인 가입이 이미 있는 경우
      const provider = providerLabels[url.searchParams.get("provider") ?? ""];
      toast.warning(
        provider
          ? `이미 ${provider}로 가입된 이메일이에요. ${provider}로 로그인해 주세요.`
          : "이미 가입된 이메일이에요. 처음 가입한 방법으로 로그인해 주세요.",
        { duration: 6000 },
      );
    }

    url.searchParams.delete("login");
    url.searchParams.delete("provider");
    window.history.replaceState(window.history.state, "", url);
  }, []);

  return null;
}
