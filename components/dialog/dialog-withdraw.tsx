"use client";

import { useState } from "react";
import { MailX, Trash2, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// 탈퇴 전에 꼭 알아야 할 점.
const withdrawNotices = [
  {
    icon: Trash2,
    title: "모든 정보 삭제",
    text: "탈퇴하면 프로필, 저장한 내 위치, 나만의 카페 목록 등 모든 정보가 삭제되며 되돌릴 수 없어요.",
  },
  {
    icon: MailX,
    title: "같은 이메일로 재가입 불가",
    text: "탈퇴한 이메일로는 다시 가입할 수 없어요.",
  },
];

// 회원 탈퇴 확인 팝업. 디자인만 있고, 탈퇴 처리는 아직 동작하지 않는다.
export function DialogWithdraw({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // 안내를 읽고 동의해야 "탈퇴하기" 버튼이 눌린다.
  const [agreed, setAgreed] = useState(false);

  function handleOpenChange(next: boolean) {
    if (!next) setAgreed(false);
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-5 rounded-3xl border-2 border-bark bg-cream p-6 text-bark shadow-[4px_5px_0_var(--color-bark)] ring-0 sm:max-w-md sm:p-7">
        <DialogHeader className="items-center gap-2">
          <span className="grid size-12 place-items-center rounded-full border-2 border-bark bg-autumn text-white">
            <UserX className="size-6" />
          </span>
          <DialogTitle className="font-paperlogy mt-2 text-2xl font-semibold">
            정말 탈퇴하시겠어요?
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-[#795f55]">
            탈퇴하기 전에 아래 내용을 꼭 확인해 주세요.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-3 border-t border-b border-dashed border-[#ceb5a0] py-6">
          {withdrawNotices.map(({ icon: Icon, title, text }) => (
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

        <div className="flex items-start gap-2.5">
          <Checkbox
            id="withdraw-agree"
            checked={agreed}
            onCheckedChange={setAgreed}
            className="mt-0.5 border-[#ceb5a0] bg-white data-checked:border-autumn data-checked:bg-autumn"
          />
          <label
            htmlFor="withdraw-agree"
            className="cursor-pointer text-sm font-medium text-bark"
          >
            위 내용을 모두 확인했으며 탈퇴에 동의합니다.
          </label>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <DialogClose
            render={
              <Button
                variant="seed"
                className="bg-white text-bark hover:bg-[#fffaf2]"
              />
            }
          >
            더 이용할게요
          </DialogClose>
          <Button
            variant="seed"
            disabled={!agreed}
            className="bg-autumn text-white hover:bg-autumn-dark"
          >
            <UserX className="size-4" />
            탈퇴하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
