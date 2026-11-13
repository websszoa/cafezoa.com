"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowDownWideNarrow,
  Loader2,
  LocateFixed,
  Navigation,
  Ruler,
  ShieldCheck,
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

// 내 위치를 켜면 달라지는 점 안내.
const locationNotices = [
  {
    icon: Ruler,
    title: "카페까지 거리 표시",
    text: "지도·카드·목록·이미지 페이지에서 내 위치부터 카페까지의 거리를 km로 보여드려요.",
  },
  {
    icon: ArrowDownWideNarrow,
    title: "가까운 순 정렬",
    text: "지도 페이지 목록을 '가까운 순'으로 정렬해 가까운 카페부터 볼 수 있어요.",
  },
  {
    icon: Navigation,
    title: "지도에 내 위치 표시",
    text: "지도 페이지에 내 위치가 함께 표시돼요.",
  },
  {
    icon: ShieldCheck,
    title: "위치 정보 보호",
    text: "위치는 이 브라우저에만 저장되며 서버로 보내거나 다른 사람에게 공개하지 않아요. 브라우저 저장소를 지우면 함께 삭제돼요. 로그인하면 위치 정보를 계정에 안전하게 저장해 다른 기기에서도 편리하게 이용할 수 있어요.",
  },
];

const statusMessages = {
  denied:
    "브라우저의 위치 권한이 꺼져 있어요. 주소창 왼쪽의 사이트 설정에서 위치 권한을 허용한 뒤 다시 눌러 주세요.",
  error: "위치를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.",
};

// 내 위치 사용 안내 팝업. "사용하기"를 누르면 브라우저 위치 권한을 요청한다.
export function DialogLocation({
  open,
  onOpenChange,
  status,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: "idle" | "loading" | "denied" | "error";
  onConfirm: () => void;
}) {
  const isLoading = status === "loading";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 rounded-3xl border-2 border-bark bg-cream p-6 text-bark shadow-[4px_5px_0_var(--color-bark)] ring-0 sm:max-w-md sm:p-7">
        <DialogHeader className="items-center gap-2">
          <span className="grid size-12 place-items-center rounded-full border-2 border-bark bg-leaf">
            <LocateFixed className="size-6" />
          </span>
          <DialogTitle className="font-paperlogy text-2xl mt-2 font-semibold">
            내 위치로 카페 찾기
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-[#795f55]">
            내 위치를 켜면 가까운 카페를 쉽게 찾을 수 있어요.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-3 border-t border-[#ceb5a0] py-6 border-dashed border-b">
          {locationNotices.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3">
              <Icon
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-autumn"
              />
              <p className="text-[14px] leading-5 text-[#795f55]">
                <span className="block font-bold text-[15px] pb-1 text-bark">
                  {title}
                </span>
                <span className="block leading-5.5">{text}</span>
              </p>
            </li>
          ))}
        </ul>

        {(status === "denied" || status === "error") && (
          <p role="alert" className="text-sm leading-6 font-bold text-autumn">
            {statusMessages[status]}
          </p>
        )}

        <DialogFooter className="gap-2 sm:justify-end">
          <DialogClose
            render={
              <Button
                variant="seed"
                className="bg-white text-bark hover:bg-cream"
              />
            }
          >
            다음에 할게요
          </DialogClose>
          <Button
            variant="seed"
            disabled={isLoading}
            onClick={onConfirm}
            className="bg-autumn text-white hover:bg-autumn-dark"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LocateFixed className="size-4" />
            )}
            {isLoading ? "위치 확인 중" : "사용하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
