"use client";

import { cn } from "@/lib/utils";
import {
  deviceLabels,
  formatDate,
  joinValues,
  providerLabels,
} from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  BadgeCheck,
  BellRing,
  Loader2,
  MessageCircleQuestion,
  ShieldCheck,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Tab = "visitors" | "members" | "support" | "subscribers";
type Count = { total: number; today: number };
type Stats = Record<Tab, Count>;

type VisitorRow = {
  id: number;
  created_at: string;
  country: string | null;
  region: string | null;
  city: string | null;
  browser: string | null;
  operating_system: string | null;
  device_type: string | null;
  profiles: { name: string | null; email: string } | null;
};
type MemberRow = {
  id: string;
  name: string | null;
  email: string;
  role: "user" | "admin";
  auth_provider: string;
  visit_count: number;
  is_withdrawn: boolean;
  last_sign_in_at: string | null;
  created_at: string;
};
type SupportRow = {
  id: number;
  type: string;
  status: string;
  name: string;
  email: string;
  subject: string;
  content: string;
  related_url: string | null;
  created_at: string;
};
type SubscriberRow = {
  id: number;
  email: string;
  status: "active" | "unsubscribed";
  age_group: string | null;
  source: string | null;
  wish: string | null;
  created_at: string;
};

const tabs = [
  { key: "visitors", label: "접속기록" },
  { key: "members", label: "회원목록" },
  { key: "support", label: "문의사항" },
  { key: "subscribers", label: "구독자" },
] as const;

const supportTypeLabels: Record<string, string> = {
  inquiry: "문의사항",
  correction: "수정요청",
  complaint: "불편신고",
  registration: "등록문의",
};
const supportStatusLabels: Record<string, string> = {
  pending: "접수됨",
  in_progress: "처리 중",
  resolved: "처리 완료",
  closed: "종료",
};

// 긴 글은 앞부분만 보여준다.
function shorten(value: string, max = 40) {
  const text = value.replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

// 목록 한 줄. 내 정보 팝업과 같은 모양: 아이콘(블릿) + "항목 : 값"
function Row({
  icon: Icon,
  label,
  value,
  muted,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <li className={cn("flex gap-2.5", muted && "opacity-60")}>
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-autumn" />
      <p className="min-w-0 text-[13px] leading-5 break-all text-[#795f55]">
        <span className="text-bark">{label}</span> : {value}
      </p>
    </li>
  );
}

function renderRows(tab: Tab, rows: unknown[]) {
  switch (tab) {
    case "visitors":
      return (rows as VisitorRow[]).map((row) => (
        <Row
          key={row.id}
          icon={Users}
          label={row.profiles?.name || row.profiles?.email || "알 수 없음"}
          value={joinValues([
            formatDate(row.created_at, { short: true }),
            row.browser,
            row.operating_system,
            row.device_type
              ? (deviceLabels[row.device_type] ?? row.device_type)
              : null,
            row.city,
            row.region,
          ])}
        />
      ));
    case "members":
      return (rows as MemberRow[]).map((row) => (
        <Row
          key={row.id}
          icon={row.role === "admin" ? BadgeCheck : UserRound}
          muted={row.is_withdrawn}
          label={row.name || row.email}
          value={joinValues([
            row.email,
            providerLabels[row.auth_provider] ?? row.auth_provider,
            `방문 ${row.visit_count.toLocaleString()}회`,
            `가입 ${formatDate(row.created_at, { short: true })}`,
            row.role === "admin" ? "관리자" : null,
            row.is_withdrawn ? "탈퇴" : null,
          ])}
        />
      ));
    case "support":
      return (rows as SupportRow[]).map((row) => (
        <Row
          key={row.id}
          icon={MessageCircleQuestion}
          muted={row.status === "resolved" || row.status === "closed"}
          label={`[${supportTypeLabels[row.type] ?? row.type}] ${row.subject}`}
          value={joinValues([
            supportStatusLabels[row.status] ?? row.status,
            row.name,
            row.email,
            formatDate(row.created_at, { short: true }),
            shorten(row.content),
          ])}
        />
      ));
    case "subscribers":
      return (rows as SubscriberRow[]).map((row) => (
        <Row
          key={row.id}
          icon={BellRing}
          muted={row.status !== "active"}
          label={row.email}
          value={joinValues([
            row.status === "active" ? "구독 중" : "해지",
            `구독 ${formatDate(row.created_at, { short: true })}`,
            row.age_group,
            row.source,
            row.wish ? shorten(row.wish) : null,
          ])}
        />
      ));
  }
}

// 관리자 팝업. 접속자 | 회원목록 | 문의사항 | 구독자 탭으로 최근 기록을 보여준다. (보기 전용)
// 관리자 확인과 목록 조회는 서버(/api/admin/stats, /api/admin/list)에서 한다.
export function DialogAdmin({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [tab, setTab] = useState<Tab>("visitors");
  const [stats, setStats] = useState<Stats | null>(null);
  const [rows, setRows] = useState<Partial<Record<Tab, unknown[]>>>({});
  // 목록을 불러오지 못한 탭. 그 탭을 다시 누르면 다시 시도한다.
  const [failed, setFailed] = useState<Partial<Record<Tab, boolean>>>({});

  // 팝업을 열 때 숫자를 불러온다.
  useEffect(() => {
    if (!open) return;
    fetch("/api/admin/stats", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: Stats | null) => setStats(data))
      .catch(() => setStats(null));
  }, [open]);

  // 탭을 처음 볼 때 목록을 불러온다. (팝업을 닫으면 비워서 다음에 새로 불러온다)
  useEffect(() => {
    if (!open || rows[tab] || failed[tab]) return;
    let ignore = false;
    fetch(`/api/admin/list?type=${tab}`, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<{ rows: unknown[] }>;
      })
      .then((data) => {
        if (ignore) return;
        setRows((prev) => ({ ...prev, [tab]: data.rows }));
      })
      .catch(() => {
        if (!ignore) setFailed((prev) => ({ ...prev, [tab]: true }));
      });
    return () => {
      ignore = true;
    };
  }, [open, tab, rows, failed]);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setRows({});
      setStats(null);
      setFailed({});
    }
    onOpenChange(next);
  }

  const current = rows[tab];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-5 rounded-3xl border-2 border-bark bg-cream p-6 text-bark shadow-[4px_5px_0_var(--color-bark)] ring-0 sm:max-w-lg sm:p-7">
        <DialogHeader className="items-center gap-2">
          <span className="grid size-14 place-items-center rounded-full border-2 border-bark bg-leaf">
            <ShieldCheck className="size-7" />
          </span>
          <DialogTitle className="font-paperlogy mt-2 text-2xl font-semibold">
            관리자
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-[#795f55]">
            최근 100건까지 보여줘요.
          </DialogDescription>
        </DialogHeader>

        {/* 탭: 구독 팝업의 선택 칩(seed 버튼)과 같은 모양. 선택된 탭은 주황색. */}
        <div
          role="tablist"
          aria-label="관리자 메뉴"
          className="grid grid-cols-4 gap-1.5"
        >
          {tabs.map(({ key, label }) => {
            const selected = tab === key;
            return (
              <Button
                key={key}
                role="tab"
                aria-selected={selected}
                variant="seed"
                onClick={() => {
                  setTab(key);
                  setFailed((prev) => ({ ...prev, [key]: false }));
                }}
                className={cn(
                  "flex-col gap-0.5 rounded-2xl px-1 py-2",
                  selected
                    ? "bg-autumn text-white shadow-[2px_2px_0_var(--color-bark)] hover:bg-autumn-dark"
                    : "bg-white text-bark hover:bg-[#fffaf2]",
                )}
              >
                {/* 전체 숫자 */}
                <span className="text-base leading-5 font-bold">
                  {stats ? stats[key].total.toLocaleString() : "-"}
                </span>
                <span className="text-xs leading-4">{label}</span>
              </Button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          className="min-h-40 flex-1 overflow-y-auto border-t border-b border-dashed border-[#ceb5a0] py-6"
        >
          {!current && !failed[tab] && (
            <div className="grid place-items-center py-10">
              <Loader2
                aria-label="목록 불러오는 중"
                className="size-6 animate-spin text-autumn"
              />
            </div>
          )}
          {!current && failed[tab] && (
            <p
              role="alert"
              className="py-8 text-center text-sm font-bold text-autumn"
            >
              목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
            </p>
          )}
          {current &&
            (current.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#795f55]">
                아직 기록이 없어요.
              </p>
            ) : (
              <ul className="space-y-2.5">{renderRows(tab, current)}</ul>
            ))}
        </div>

        <DialogFooter className="gap-2 sm:justify-center">
          <DialogClose
            render={
              <Button
                variant="seed"
                className="bg-autumn px-8 text-white hover:bg-autumn-dark"
              />
            }
          >
            닫기
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
