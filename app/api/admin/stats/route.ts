import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/auth/require-admin";

// 관리자용 오늘 현황 숫자 (components/admin/admin-stats.tsx → GET /api/admin/stats)
// 관리자(profiles.role = 'admin')로 로그인한 경우에만 숫자를 돌려주고, 아니면 403.
// 각 항목은 { total: 전체, today: 오늘(한국 시간 0시 이후) } 형태다.

// 한국 시간 오늘 0시를 UTC ISO 문자열로 만든다.
function getTodayStartIso() {
  const koreaOffset = 9 * 60 * 60 * 1000;
  const koreaNow = new Date(Date.now() + koreaOffset);
  koreaNow.setUTCHours(0, 0, 0, 0);
  return new Date(koreaNow.getTime() - koreaOffset).toISOString();
}

export async function GET() {
  // 1. 요청한 사람이 관리자인지 본인 권한으로 확인한다.
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // 2. 관리자가 확인되면 서버 키로 전체 숫자를 센다.
  const admin = createAdminClient();
  const todayStart = getTodayStartIso();

  // 개수만 세는 요청 (행 데이터는 받지 않는다)
  const count = async (
    table: "profile_info" | "profiles" | "support_requests" | "subscriptions",
    since?: string,
  ) => {
    let query = admin.from(table).select("*", { count: "exact", head: true });
    if (table === "subscriptions") query = query.eq("status", "active");
    if (since) query = query.gte("created_at", since);
    const { count: value } = await query;
    return value ?? 0;
  };

  const [
    visitorsTotal,
    visitorsToday,
    membersTotal,
    membersToday,
    supportTotal,
    supportToday,
    subscribersTotal,
    subscribersToday,
  ] = await Promise.all([
    // 접속자: 로그인 기록(profile_info) 수. 관리자 팝업 접속자 목록과 같은 기준이다.
    count("profile_info"),
    count("profile_info", todayStart),
    count("profiles"),
    count("profiles", todayStart),
    count("support_requests"),
    count("support_requests", todayStart),
    count("subscriptions"),
    count("subscriptions", todayStart),
  ]);

  return NextResponse.json(
    {
      visitors: { total: visitorsTotal, today: visitorsToday },
      members: { total: membersTotal, today: membersToday },
      support: { total: supportTotal, today: supportToday },
      subscribers: { total: subscribersTotal, today: subscribersToday },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
