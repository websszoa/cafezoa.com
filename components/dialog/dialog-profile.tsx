"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  deviceLabels,
  formatDate,
  joinValues,
  providerLabels,
} from "@/lib/labels";
import {
  BadgeCheck,
  CalendarHeart,
  Clock3,
  Footprints,
  Globe2,
  Loader2,
  LogIn,
  Mail,
  MapPinned,
  MessageSquareText,
  MonitorSmartphone,
  Phone,
  UserRound,
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

// profiles 테이블에서 읽는 내 정보 (sql/supabase-profile.sql)
type Profile = {
  name: string | null;
  email: string;
  role: "user" | "admin";
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  auth_provider: string;
  latitude: number | null;
  longitude: number | null;
  visit_count: number;
  last_sign_in_at: string | null;
  created_at: string;
};

// profile_info 테이블의 가장 최근 접속 기록 (sql/supabase-profile-info.sql)
type LoginInfo = {
  country: string | null;
  region: string | null;
  city: string | null;
  browser: string | null;
  operating_system: string | null;
  device_type: string | null;
  created_at: string;
};

// 로그인한 사용자의 내 정보 팝업. 계정·위치·최근 접속 정보를 보여준다. (보기 전용)
export function DialogProfile({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loginInfo, setLoginInfo] = useState<LoginInfo | null>(null);
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  // 팝업을 열 때마다 최신 정보를 불러온다. (RLS로 본인 정보만 조회된다)
  useEffect(() => {
    if (!open) return;
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setStatus("error");
        return;
      }

      const [profileResult, loginResult] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            "name, email, role, avatar_url, phone, bio, auth_provider, latitude, longitude, visit_count, last_sign_in_at, created_at",
          )
          .eq("id", user.id)
          .maybeSingle<Profile>(),
        supabase
          .from("profile_info")
          .select(
            "country, region, city, browser, operating_system, device_type, created_at",
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle<LoginInfo>(),
      ]);

      if (profileResult.error || !profileResult.data) {
        setStatus("error");
        return;
      }
      setProfile(profileResult.data);
      setLoginInfo(loginResult.data ?? null);
      setStatus("done");
    });
  }, [open]);

  // 팝업을 닫으면 다음에 열 때 다시 불러오도록 로딩 상태로 되돌린다.
  function handleOpenChange(next: boolean) {
    if (!next) setStatus("loading");
    onOpenChange(next);
  }

  // [아이콘, 항목 이름, 값] — 카페 소식 구독하기 안내 목록과 같은 모양으로 보여준다.
  const rows: [LucideIcon, string, string][] = profile
    ? [
        [Mail, "이메일", profile.email],
        [
          LogIn,
          "가입 방식",
          providerLabels[profile.auth_provider] ?? profile.auth_provider,
        ],
        [
          BadgeCheck,
          "회원 구분",
          profile.role === "admin" ? "관리자" : "일반 회원",
        ],
        [CalendarHeart, "가입일", formatDate(profile.created_at)],
        [Clock3, "마지막 로그인", formatDate(profile.last_sign_in_at)],
        [Footprints, "방문 횟수", `${profile.visit_count.toLocaleString()}회`],
        [Phone, "전화번호", profile.phone || "-"],
        [MessageSquareText, "자기소개", profile.bio || "-"],
        [
          MapPinned,
          "저장된 내 위치",
          profile.latitude !== null && profile.longitude !== null
            ? `${Number(profile.latitude).toFixed(4)}, ${Number(profile.longitude).toFixed(4)}`
            : "저장 안 됨",
        ],
        [
          MonitorSmartphone,
          "최근 접속 기기",
          loginInfo
            ? joinValues([
                loginInfo.browser,
                loginInfo.operating_system,
                loginInfo.device_type
                  ? (deviceLabels[loginInfo.device_type] ??
                    loginInfo.device_type)
                  : null,
              ])
            : "-",
        ],
        [
          Globe2,
          "최근 접속 지역",
          loginInfo
            ? joinValues([loginInfo.city, loginInfo.region, loginInfo.country])
            : "-",
        ],
      ]
    : [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] gap-5 overflow-y-auto rounded-3xl border-2 border-bark bg-cream p-6 text-bark shadow-[4px_5px_0_var(--color-bark)] ring-0 sm:max-w-md sm:p-7">
        <DialogHeader className="items-center gap-2">
          <span className="relative grid size-16 place-items-center overflow-hidden rounded-full border-2 border-bark bg-leaf">
            {profile?.avatar_url ? (
              // 구글 프로필 사진. Next 이미지 최적화를 거치지 않고 바로 불러온다.
              <Image
                unoptimized
                src={profile.avatar_url}
                alt=""
                fill
                sizes="64px"
                referrerPolicy="no-referrer"
                className="object-cover"
              />
            ) : (
              <UserRound className="size-8" />
            )}
          </span>
          <DialogTitle className="font-paperlogy mt-2 text-2xl font-semibold">
            {profile?.name ? `${profile.name}님의 정보` : "내 정보"}
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-[#795f55]">
            카페조아 계정에 저장된 정보를 확인할 수 있어요.
          </DialogDescription>
        </DialogHeader>

        <div className="border-t border-b border-dashed border-[#ceb5a0] py-6">
          {status === "loading" && (
            <div className="grid place-items-center py-8">
              <Loader2
                aria-label="내 정보 불러오는 중"
                className="size-6 animate-spin text-autumn"
              />
            </div>
          )}
          {status === "error" && (
            <p
              role="alert"
              className="py-6 text-center text-sm font-bold text-autumn"
            >
              내 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
            </p>
          )}
          {status === "done" && (
            <ul className="space-y-2.5">
              {rows.map(([Icon, label, value]) => (
                <li key={label} className="flex gap-2.5">
                  <Icon
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-autumn"
                  />
                  {/* 한 줄 표기: "항목 : 값" */}
                  <p className="min-w-0 text-[14px] leading-5 break-all text-[#795f55]">
                    <span className="text-bark">{label}</span> : {value}
                  </p>
                </li>
              ))}
            </ul>
          )}
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
            확인
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
