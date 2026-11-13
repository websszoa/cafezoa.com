"use client";

import { useSyncExternalStore } from "react";
import { Heart, LayoutGrid, MapPinned, PartyPopper } from "lucide-react";
import { CelebrationDecor } from "@/components/dialog/dialog-celebration";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// 가입하고 바로 해 볼 수 있는 것.
const welcomeTips = [
  {
    icon: MapPinned,
    text: "위치를 설정하면 내 주변 카페를 더 쉽게 찾을 수 있어요. 로그인하면 위치 설정을 계정에 저장해 다른 기기에서도 이용할 수 있어요.",
  },
  {
    icon: Heart,
    text: "마음에 드는 카페는 찜해 두고, 언제든 나만의 카페 목록에서 다시 만나보세요.",
  },
  {
    icon: LayoutGrid,
    text: "지도·카드·목록·이미지, 네 가지 방식으로 취향에 맞는 카페를 둘러보세요.",
  },
];

// 첫 가입 표시(?welcome=1)는 로그인 콜백(app/auth/callback/google/route.ts)이 붙인다.
const WELCOME_PARAM = "welcome";
const CHANGE_EVENT = "cafezoa-welcome-change";

function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function hasWelcomeParam() {
  return new URLSearchParams(window.location.search).get(WELCOME_PARAM) === "1";
}

// 주소에서 ?welcome=1을 지워, 새로고침하거나 공유해도 팝업이 다시 뜨지 않게 한다.
function removeWelcomeParam() {
  const url = new URL(window.location.href);
  url.searchParams.delete(WELCOME_PARAM);
  window.history.replaceState(window.history.state, "", url);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// 처음 회원 가입한 사용자에게 한 번 보여주는 축하 팝업.
export function DialogWelcome() {
  // 서버에서는 주소를 알 수 없으므로 닫힌 상태로 그리고, 브라우저에서 주소를 확인한다.
  const open = useSyncExternalStore(subscribe, hasWelcomeParam, () => false);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) removeWelcomeParam();
      }}
    >
      <DialogContent className="gap-5 overflow-hidden rounded-3xl border-2 border-bark bg-cream p-6 text-center text-bark shadow-[4px_5px_0_var(--color-bark)] ring-0 sm:max-w-md sm:p-7">
        {/* 축하 장식: 메인 화면의 낙엽 이미지와 색 조각 */}
        <CelebrationDecor />

        <DialogHeader className="relative items-center gap-2 pt-6">
          <span className="grid size-16 place-items-center rounded-full border-2 border-bark bg-leaf shadow-[3px_3px_0_var(--color-bark)]">
            <PartyPopper className="size-8" />
          </span>
          <DialogTitle className="font-paperlogy mt-3 text-2xl font-semibold">
            카페조아에 오신 걸 환영해요!
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-[#795f55]">
            나만의 취향에 맞는 카페를 발견해 보세요. ☕
          </DialogDescription>
        </DialogHeader>

        <ul className="relative space-y-2.5 rounded-2xl border-2 border-dashed border-[#ceb5a0] bg-white/70 px-4 py-3 text-left">
          {welcomeTips.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex gap-2.5 text-[13px] leading-5 text-[#795f55]"
            >
              <Icon
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-autumn"
              />
              {text}
            </li>
          ))}
        </ul>

        <DialogFooter className="relative sm:justify-center">
          <DialogClose
            render={
              <Button
                variant="seed"
                className="bg-autumn px-8 text-white hover:bg-autumn-dark"
              />
            }
          >
            카페 시작하기
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
