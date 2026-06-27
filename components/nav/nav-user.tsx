"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, Bell, LogOut, CreditCard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function NavUser() {
  const [avatarSrc, setAvatarSrc] = useState("");

  useEffect(() => {
    const id = String(Math.floor(Math.random() * 10) + 1).padStart(2, "0");
    setAvatarSrc(`/face/face${id}.webp`);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-center size-10 rounded-full hover:bg-muted transition-colors outline-none">
          <Avatar className="size-8">
            <AvatarImage src={avatarSrc} alt="user" />
            <AvatarFallback className="bg-muted text-muted-foreground">
              <User className="size-4" />
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" className="w-52 mb-1">
        <DropdownMenuLabel className="flex items-center gap-2 p-2">
          <Avatar className="size-8">
            <AvatarImage src={avatarSrc} alt="user" />
            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
              <User className="size-3" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none">게스트</span>
            <span className="text-xs text-muted-foreground mt-0.5">
              로그인이 필요합니다
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="size-4" />
            계정
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className="size-4" />
            결제
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell className="size-4" />
            알림
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="size-4" />
            설정
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <LogOut className="size-4" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
