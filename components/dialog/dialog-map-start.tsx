"use client";

import {
  ChevronRight,
  LocateFixed,
  MapPinned,
  SquareParking,
  Star,
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

export type MapStartChoice = "nearby" | "naver" | "google" | "parking";

// 지도 페이지에 들어오면 고를 수 있는 보기 방식.
const mapStartChoices: {
  key: MapStartChoice;
  icon: typeof Star;
  title: string;
  text: string;
}[] = [
  {
    key: "nearby",
    icon: LocateFixed,
    title: "내 위치 기준으로 검색하기",
    text: "가까운 카페부터 거리순으로 보여드려요.",
  },
  {
    key: "naver",
    icon: Star,
    title: "네이버 평점 순으로 보기",
    text: "네이버 평점이 높은 카페부터 보여드려요.",
  },
  {
    key: "google",
    icon: Star,
    title: "구글 평점 순으로 보기",
    text: "구글 평점이 높은 카페부터 보여드려요.",
  },
  {
    key: "parking",
    icon: SquareParking,
    title: "주차 무료 카페 보기",
    text: "무료로 주차할 수 있는 카페만 모아 보여드려요.",
  },
];

// 지도 페이지 시작 팝업. 보기 방식을 고르면 그 기준으로 카페 목록이 열린다.
export function DialogMapStart({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (choice: MapStartChoice) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 rounded-3xl border-2 border-bark bg-cream p-6 text-bark shadow-[4px_5px_0_var(--color-bark)] ring-0 sm:max-w-md sm:p-7">
        <DialogHeader className="items-center gap-2">
          <span className="grid size-12 place-items-center rounded-full border-2 border-bark bg-leaf">
            <MapPinned className="size-6" />
          </span>
          <DialogTitle className="font-paperlogy mt-2 text-2xl font-semibold">
            어떻게 카페를 찾아볼까요?
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-[#795f55]">
            원하는 방식을 고르면 지도에 카페를 보여드려요.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2.5 border-y border-dashed border-[#ceb5a0] py-6">
          {mapStartChoices.map(({ key, icon: Icon, title, text }) => (
            <li key={key}>
              <button
                type="button"
                onClick={() => onPick(key)}
                className="flex w-full items-center gap-3 rounded-2xl border-2 border-bark bg-white px-4 py-3 text-left shadow-[3px_3px_0_var(--color-bark)] transition-colors duration-200 ease-out outline-none hover:bg-cream focus-visible:bg-cream"
              >
                <Icon
                  aria-hidden="true"
                  className="size-5 shrink-0 text-autumn"
                />
                <span className="min-w-0 flex-1">
                  <span className="block pb-0.5 text-[15px] font-bold text-bark">
                    {title}
                  </span>
                  <span className="block text-[13px] leading-5 text-[#795f55]">
                    {text}
                  </span>
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-bark"
                />
              </button>
            </li>
          ))}
        </ul>

        <DialogFooter className="sm:justify-center">
          <DialogClose
            render={
              <button
                type="button"
                className="mx-auto rounded-full px-2 py-1 text-sm font-bold text-[#795f55] underline-offset-4 transition-colors outline-none hover:text-bark hover:underline focus-visible:text-bark focus-visible:underline"
              />
            }
          >
            그냥 지도 둘러볼게요
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
