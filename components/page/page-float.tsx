"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLocation } from "@/components/location/location-provider";
import { introLinks } from "@/lib/menu";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { DialogLogin } from "@/components/dialog/dialog-login";
import {
  LocateFixed,
  LogIn,
  MessageCircleQuestion,
  Settings,
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
// 왼쪽은 내 위치 확인과 보기 방식(지도·카드·목록·이미지) 이동 메뉴, 오른쪽은 로그인·문의 메뉴. (로그인 기능은 아직 없음)
export function PageFloat() {
  // 지도 페이지는 PC에서 왼쪽 목록 패널이 있어서, 왼쪽 버튼을 패널 오른쪽으로 옮긴다.
  const isMap = usePathname() === "/map";
  const { checkLocation } = useLocation();
  const [loginOpen, setLoginOpen] = useState(false);

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
              aria-label="설정 메뉴"
              className="fixed right-4 bottom-5 z-40 size-10 bg-leaf p-0 text-bark hover:bg-leaf-dark"
            />
          }
        >
          <Settings className="size-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="end"
          sideOffset={8}
          className="w-48 rounded-2xl border-2 border-bark bg-white p-1.5 shadow-[3px_3px_0_var(--color-bark)] ring-0"
        >
          <DropdownMenuItem
            onClick={() => setLoginOpen(true)}
            className="rounded-xl py-2 font-bold text-bark focus:bg-cream focus:text-bark"
          >
            <LogIn className="text-autumn" />
            로그인 하기
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#ead9ca]" />
          <DropdownMenuItem
            render={<Link href="/support?type=inquiry" />}
            className="rounded-xl py-2 text-bark focus:bg-cream focus:text-bark"
          >
            <MessageCircleQuestion className="text-autumn" />
            문의하기
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogLogin open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}
