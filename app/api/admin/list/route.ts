import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/auth/require-admin";

// 관리자 팝업의 목록 (components/dialog/dialog-admin.tsx → GET /api/admin/list?type=...)
// type: visitors(접속자) | members(회원목록) | support(문의사항) | subscribers(구독자)
// 관리자로 로그인한 경우에만 최신순 최대 LIMIT개를 돌려주고, 아니면 403.

const LIMIT = 100;

const queries = {
  // 접속 기록(profile_info)과 회원 이름·이메일
  visitors: (admin: ReturnType<typeof createAdminClient>) =>
    admin
      .from("profile_info")
      .select(
        "id, created_at, country, region, city, browser, operating_system, device_type, profiles(name, email)",
      )
      .order("created_at", { ascending: false })
      .limit(LIMIT),
  members: (admin: ReturnType<typeof createAdminClient>) =>
    admin
      .from("profiles")
      .select(
        "id, name, email, role, auth_provider, visit_count, is_withdrawn, last_sign_in_at, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(LIMIT),
  support: (admin: ReturnType<typeof createAdminClient>) =>
    admin
      .from("support_requests")
      .select(
        "id, type, status, name, email, subject, content, related_url, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(LIMIT),
  subscribers: (admin: ReturnType<typeof createAdminClient>) =>
    admin
      .from("subscriptions")
      .select("id, email, status, age_group, source, wish, created_at")
      .order("created_at", { ascending: false })
      .limit(LIMIT),
};

export type AdminListType = keyof typeof queries;

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const type = request.nextUrl.searchParams.get("type");
  if (!type || !(type in queries)) {
    return NextResponse.json({ error: "invalid type" }, { status: 400 });
  }

  const { data, error } = await queries[type as AdminListType](
    createAdminClient(),
  );
  if (error) {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }

  return NextResponse.json(
    { rows: data ?? [] },
    { headers: { "Cache-Control": "no-store" } },
  );
}
