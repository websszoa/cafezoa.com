"use client";

import { Button } from "@/components/ui/button";
import { Eye, Heart, LogIn, MapPinned } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// 로그인하면 달라지는 점 안내.
const loginNotices = [
  {
    icon: MapPinned,
    title: "위치 정보 저장",
    text: "내 위치를 계정에 저장해 다른 기기에서도 다시 켜지 않고 카페까지 거리를 볼 수 있어요.",
  },
  {
    icon: Heart,
    title: "나만의 카페 리스트",
    text: "마음에 드는 카페를 모아 나만의 카페 리스트를 만들고 언제든 다시 꺼내 볼 수 있어요.",
  },
  {
    icon: Eye,
    title: "공개 안내",
    text: "로그인하면 프로필 정보(이름·프로필 사진)와 내가 만든 카페 리스트가 다른 이용자에게 공개돼요.",
  },
];

// 로그인 안내 팝업. 디자인만 있고, 소셜 로그인 버튼은 아직 동작하지 않는다.
export function DialogLogin({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 rounded-3xl border-2 border-bark bg-cream p-6 text-bark shadow-[4px_5px_0_var(--color-bark)] ring-0 sm:max-w-md sm:p-7">
        <DialogHeader className="items-center gap-2">
          <span className="grid size-12 place-items-center rounded-full border-2 border-bark bg-leaf">
            <LogIn className="size-6" />
          </span>
          <DialogTitle className="font-paperlogy mt-2 text-2xl font-semibold">
            로그인하고 더 편하게
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-[#795f55]">
            로그인하면 카페조아를 더 편리하게 이용할 수 있어요.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-3 border-t border-b border-dashed border-[#ceb5a0] py-6">
          {loginNotices.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3">
              <Icon
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-autumn"
              />
              <p className="text-[14px] leading-5 text-[#795f55]">
                <span className="block pb-1 text-[15px] font-bold text-bark">
                  {title}
                </span>
                <span className="block leading-5.5">{text}</span>
              </p>
            </li>
          ))}
        </ul>

        <div className="grid gap-2">
          <Button
            variant="seed"
            className="w-full bg-white text-bark hover:bg-neutral-50"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
              <path
                fill="#4285F4"
                d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z"
              />
              <path
                fill="#34A853"
                d="M12 22c2.7 0 4.98-.9 6.63-2.42l-3.24-2.53c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.61A10 10 0 0 0 12 22Z"
              />
              <path
                fill="#FBBC05"
                d="M6.39 13.88A6 6 0 0 1 6.08 12c0-.65.11-1.29.31-1.88V7.51H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.49l3.35-2.61Z"
              />
              <path
                fill="#EA4335"
                d="M12 5.99c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.96 5.51l3.35 2.61C7.18 7.75 9.39 5.99 12 5.99Z"
              />
            </svg>
            Google로 계속하기
          </Button>
          <Button
            variant="seed"
            className="w-full bg-[#fee500] text-bark hover:bg-[#f4dc00]"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
              <path
                fill="currentColor"
                d="M12 3C6.48 3 2 6.5 2 10.82c0 2.76 1.83 5.18 4.59 6.57l-.93 3.42a.38.38 0 0 0 .58.42l4.08-2.7c.55.07 1.11.11 1.68.11 5.52 0 10-3.5 10-7.82S17.52 3 12 3Z"
              />
            </svg>
            카카오로 계속하기
          </Button>
          <Button
            variant="seed"
            className="w-full bg-[#44ba5b] text-white hover:bg-[#3a9e4d]"
          >
            <svg aria-hidden="true" viewBox="-3 -3 30 30" className="size-4">
              <path
                fill="currentColor"
                d="M16.273 12.845 7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845Z"
              />
            </svg>
            네이버로 계속하기
          </Button>
          <DialogClose
            render={
              <Button
                variant="ghost"
                className="mt-1 text-sm text-[#795f55] hover:bg-transparent hover:text-bark hover:underline underline-offset-3"
              />
            }
          >
            다음에 할게요
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
