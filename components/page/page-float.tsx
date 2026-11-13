"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLocation } from "@/components/location/location-provider";
import { introLinks } from "@/lib/menu";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { DialogLogin } from "@/components/dialog/dialog-login";
import { DialogSubscribe } from "@/components/dialog/dialog-subscribe";
import { DialogProfile } from "@/components/dialog/dialog-profile";
import { DialogAdmin } from "@/components/dialog/dialog-admin";
import {
  BellRing,
  LocateFixed,
  LogIn,
  LogOut,
  MessageCircleQuestion,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// 모든 페이지 하단에 떠 있는 버튼.
// 왼쪽은 내 위치 확인과 보기 방식(지도·카드·목록·이미지) 이동 메뉴, 오른쪽은 로그인(로그아웃)·문의·구독 메뉴.
// 로그인하면 오른쪽 버튼 아이콘이 프로필 사진으로 바뀐다.
export function PageFloat() {
  // 지도 페이지는 PC에서 왼쪽 목록 패널이 있어서, 왼쪽 버튼을 패널 오른쪽으로 옮긴다.
  const isMap = usePathname() === "/map";
  const { checkLocation } = useLocation();
  const [loginOpen, setLoginOpen] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  // 관리자(profiles.role = 'admin')로 로그인했을 때만 메뉴에 "관리자"를 보여준다.
  // (화면 표시용일 뿐이고, 실제 데이터는 서버에서 관리자 확인 후에만 내려준다)
  const [isAdmin, setIsAdmin] = useState(false);

  // 로그인한 사용자. 로그인·로그아웃할 때마다 바뀐다. (avatarUrl: 구글 프로필 사진)
  const [user, setUser] = useState<{
    name: string | null;
    avatarUrl: string | null;
  } | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = createClient().auth.onAuthStateChange((_event, session) => {
      if (session) {
        // onAuthStateChange 안에서 바로 Supabase를 await하면 막힐 수 있어 다음 틱으로 미룬다.
        setTimeout(() => {
          createClient()
            .from("profiles")
            .select("role, is_withdrawn")
            .eq("id", session.user.id)
            .maybeSingle()
            .then(({ data }) =>
              setIsAdmin(data?.role === "admin" && !data.is_withdrawn),
            );
        }, 0);
      } else {
        setIsAdmin(false);
      }
      const metadata = session?.user.user_metadata;
      setUser(
        session
          ? {
              name: metadata?.full_name ?? metadata?.name ?? null,
              avatarUrl: metadata?.avatar_url ?? metadata?.picture ?? null,
            }
          : null,
      );
    });
    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    const { error } = await createClient().auth.signOut();
    if (error) {
      toast.error("로그아웃하지 못했어요. 잠시 후 다시 시도해 주세요.");
      return;
    }
    toast.success("로그아웃했어요.");
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="seed"
              size="icon"
              aria-label="내 위치·페이지 이동 메뉴"
              className={cn(
                "fixed bottom-5 left-4 z-40 size-10 bg-leaf p-0 text-bark hover:bg-leaf-dark",
                isMap && "lg:left-[calc(min(23rem,calc(100vw-2rem))+2rem)]",
              )}
            />
          }
        >
          <LocateFixed className="size-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="start"
          sideOffset={8}
          className="w-48 rounded-2xl border-2 border-bark bg-white p-1.5 shadow-[3px_3px_0_var(--color-bark)] ring-0"
        >
          <DropdownMenuItem
            onClick={checkLocation}
            className="rounded-xl py-2 font-bold text-bark focus:bg-cream focus:text-bark"
          >
            <LocateFixed className="text-autumn" />내 위치 확인하기
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#ead9ca]" />
          {introLinks.map(({ href, description, icon: Icon }) => (
            <DropdownMenuItem
              key={href}
              render={<Link href={href} />}
              className="rounded-xl py-2 text-bark focus:bg-cream focus:text-bark"
            >
              <Icon className="text-autumn" />
              {description}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="seed"
              size="icon"
              aria-label={user ? "내 계정 메뉴" : "설정 메뉴"}
              className="fixed right-4 bottom-5 z-40 size-10 overflow-hidden bg-leaf p-0 text-bark hover:bg-leaf-dark"
            />
          }
        >
          {user?.avatarUrl ? (
            // 구글 프로필 사진. Next 이미지 최적화를 거치지 않고 바로 불러온다.
            <Image
              unoptimized
              src={user.avatarUrl}
              alt=""
              width={40}
              height={40}
              referrerPolicy="no-referrer"
              className="size-full object-cover"
            />
          ) : (
            <Settings className="size-5" />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="end"
          sideOffset={8}
          className="w-48 rounded-2xl border-2 border-bark bg-white p-1.5 shadow-[3px_3px_0_var(--color-bark)] ring-0"
        >
          {user ? (
            <DropdownMenuItem
              onClick={signOut}
              className="rounded-xl py-2 font-bold text-bark focus:bg-cream focus:text-bark"
            >
              <LogOut className="text-autumn" />
              로그아웃
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => setLoginOpen(true)}
              className="rounded-xl py-2 font-bold text-bark focus:bg-cream focus:text-bark"
            >
              <LogIn className="text-autumn" />
              로그인 하기
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator className="bg-[#ead9ca]" />
          <DropdownMenuItem
            render={<Link href="/support?type=inquiry" />}
            className="rounded-xl py-2 text-bark focus:bg-cream focus:text-bark"
          >
            <MessageCircleQuestion className="text-autumn" />
            문의하기
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setSubscribeOpen(true)}
            className="rounded-xl py-2 text-bark focus:bg-cream focus:text-bark"
          >
            <BellRing className="text-autumn" />
            구독하기
          </DropdownMenuItem>
          {user && (
            <>
              <DropdownMenuSeparator className="bg-[#ead9ca]" />
              <DropdownMenuItem
                onClick={() => setProfileOpen(true)}
                className="rounded-xl py-2 text-bark focus:bg-cream focus:text-bark"
              >
                <UserRound className="text-autumn" />내 정보
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem
                  onClick={() => setAdminOpen(true)}
                  className="rounded-xl py-2 font-bold text-bark focus:bg-cream focus:text-bark"
                >
                  <ShieldCheck className="text-autumn" />
                  관리자
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogLogin open={loginOpen} onOpenChange={setLoginOpen} />
      <DialogSubscribe open={subscribeOpen} onOpenChange={setSubscribeOpen} />
      <DialogProfile open={profileOpen} onOpenChange={setProfileOpen} />
      <DialogAdmin open={adminOpen} onOpenChange={setAdminOpen} />
    </>
  );
}
