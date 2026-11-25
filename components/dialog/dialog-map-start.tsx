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
}[] = [
  {
    key: "nearby",
    icon: LocateFixed,
    title: "내 주변 카페 찾기",
  },
  {
    key: "naver",
    icon: Star,
    title: "네이버 평점 순으로 보기",
  },
  {
    key: "google",
    icon: Star,
    title: "구글 평점 순으로 보기",
  },
  {
    key: "parking",
    icon: SquareParking,
    title: "주차 무료 카페 보기",
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
            오늘은 어떤 카페에 가볼까요?
          </DialogTitle>
          <DialogDescription className="sr-only text-sm leading-6 text-[#795f55]">
            원하는 방식을 고르면 지도에 카페를 보여드려요.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2.5 border-y border-dashed border-[#ceb5a0] py-6">
          {mapStartChoices.map(({ key, icon: Icon, title }) => (
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
                <span className="min-w-0 flex-1 text-[15px] font-bold text-bark">
                  {title}
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
