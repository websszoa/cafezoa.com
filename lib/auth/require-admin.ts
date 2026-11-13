import "server-only";

import { createClient } from "@/lib/supabase/server";

// 요청한 사람이 관리자(profiles.role = 'admin', 탈퇴하지 않음)인지 본인 권한으로 확인한다.
// 관리자면 true. /api/admin/* 라우트에서 서버 키를 쓰기 전에 항상 먼저 호출한다.
export async function isAdminRequest() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_withdrawn")
    .eq("id", user.id)
    .maybeSingle();
  return profile?.role === "admin" && !profile.is_withdrawn;
}
