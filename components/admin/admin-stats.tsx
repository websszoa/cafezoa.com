"use client";

import { useEffect, useState } from "react";
import { BellRing, MessageCircleQuestion, UserPlus, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Count = { total: number; today: number };
type Stats = {
  visitors: Count;
  members: Count;
  support: Count;
  subscribers: Count;
};

const items = [
  { key: "visitors", label: "접속 기록", icon: Users },
  { key: "members", label: "회원가입한 사람", icon: UserPlus },
  { key: "support", label: "문의사항", icon: MessageCircleQuestion },
  { key: "subscribers", label: "구독한 사람", icon: BellRing },
] as const;

// 관리자로 로그인했을 때만 보이는 현황 숫자. "전체(오늘)" 형식으로 보여준다.
// 관리자 확인과 숫자 계산은 서버(/api/admin/stats)에서 한다.
export function AdminStats({ className }: { className?: string }) {
  const [stats, setStats] = useState<Stats | null>(null);

  // 로그인·로그아웃할 때마다 다시 확인한다. 관리자가 아니면(403) 아무것도 보여주지 않는다.
  useEffect(() => {
    const {
      data: { subscription },
    } = createClient().auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setStats(null);
        return;
      }
      fetch("/api/admin/stats", { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : null))
        .then((data: Stats | null) => setStats(data))
        .catch(() => setStats(null));
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!stats) return null;

  return (
    <dl className={className}>
      <div className="rounded-2xl border-2 border-bark bg-white/95 px-4 py-3 text-bark shadow-[3px_3px_0_var(--color-bark)] backdrop-blur">
        <p className="font-pappin mb-2 text-[10px] font-bold tracking-[0.18em] text-autumn uppercase">
          Admin · today
        </p>
        <div className="space-y-1.5">
          {items.map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center gap-2 text-[13px]">
              <Icon aria-hidden="true" className="size-3.5 text-autumn" />
              <dt className="font-medium">{label} :</dt>
              <dd className="font-bold">
                {stats[key].total.toLocaleString()}
                <span className="ml-0.5 text-autumn">
                  ({stats[key].today.toLocaleString()})
                </span>
              </dd>
            </div>
          ))}
        </div>
      </div>
    </dl>
  );
}
