"use client";

import { CelebrationDecor } from "@/components/dialog/dialog-celebration";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  subscribeAgeGroups,
  subscribePriorities,
  subscribeSources,
  subscribeStyles,
} from "@/lib/subscribe";
import {
  BellRing,
  Check,
  Gift,
  Heart,
  PartyPopper,
  Sparkles,
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
import {
  subscribeFormSchema,
  type SubscribeFormValues,
} from "@/lib/validations";

// 구독하면 받을 수 있는 소식 안내.
const subscribeNotices = [
  {
    icon: Sparkles,
    title: "새로운 카페 소식",
    text: "새롭게 문을 연 카페부터 요즘 인기 있는 카페까지, 놓치지 않고 알려드려요.",
  },
  {
    icon: Gift,
    title: "이벤트·할인 혜택",
    text: "카페에서 진행하는 특별한 이벤트와 할인 혜택을 빠르게 전해드려요.",
  },
  {
    icon: Heart,
    title: "내 취향에 맞는 카페",
    text: "관심 있는 카페와 취향을 바탕으로 나에게 어울리는 카페를 추천해 드려요.",
  },
];

// 선택지 버튼 (나이대·알게 된 경로는 하나만, 중요하게 생각하는 것은 여러 개)
// multiple이면 value는 고른 값 배열, 아니면 고른 값 하나다.
function ChoiceChips({
  options,
  value,
  onChange,
  invalid = false,
  label,
  multiple = false,
}: {
  options: readonly { value: string; label: string }[];
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  invalid?: boolean;
  label: string;
  multiple?: boolean;
}) {
  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

  function handleClick(optionValue: string) {
    if (!multiple) {
      onChange(optionValue);
      return;
    }
    onChange(
      selectedValues.includes(optionValue)
        ? selectedValues.filter((item) => item !== optionValue)
        : [...selectedValues, optionValue],
    );
  }

  return (
    <div
      role={multiple ? "group" : "radiogroup"}
      aria-label={label}
      aria-invalid={invalid}
      className="flex flex-wrap gap-1.5"
    >
      {options.map((option) => {
        const selected = selectedValues.includes(option.value);
        return (
          <Button
            key={option.value}
            role={multiple ? "checkbox" : "radio"}
            aria-checked={selected}
            variant="seed"
            onClick={() => handleClick(option.value)}
            className={cn(
              "px-3 py-1.5 text-xs",
              selected
                ? "bg-autumn text-white hover:bg-autumn-dark"
                : "bg-white text-bark hover:bg-[#fffaf2]",
            )}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}

// 구독 신청 팝업. 1단계(안내·이메일·동의) → 2단계(설문). 완료하면 /api/subscribe로 저장하고 구독 메일을 보낸다.
export function DialogSubscribe({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // 1단계: 안내 + 이메일·동의 → "구독하기" → 2단계: 설문(나이대·경로·관심 정보)
  // → 3단계: 완료 축하 메시지
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"subscribe" | "survey" | "done">(
    "subscribe",
  );

  const {
    register,
    control,
    handleSubmit,
    trigger,
    getValues,
    reset,
    formState: { errors },
  } = useForm<SubscribeFormValues>({
    resolver: zodResolver(subscribeFormSchema),
    defaultValues: {
      email: "",
      styles: [],
      priorities: [],
      wish: "",
      privacyConsent: false,
    },
  });

  // 2단계 완료: 구독 신청을 저장하고(POST /api/subscribe) 축하 화면으로 넘어간다.
  // 저장이 끝나면 서버가 구독 완료 메일과 관리자 알림 메일을 보낸다.
  async function submitSubscription(values: SubscribeFormValues) {
    setSubmitting(true);
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        setStep("done");
        return;
      }
      toast.error(
        response.status === 409
          ? "이미 구독 중인 이메일이에요."
          : "구독 신청을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.",
      );
    } catch {
      toast.error("구독 신청을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  // 1단계 항목(이메일·동의)만 검사하고, 통과하면 설문 단계로 넘어간다.
  async function goToSurvey() {
    const valid = await trigger(["email", "privacyConsent"]);
    if (valid) setStep("survey");
  }

  // 팝업을 닫으면 다음에 열 때 처음 단계부터 보이게 한다.
  // 완료 후 닫으면 입력값도 비운다.
  function handleOpenChange(next: boolean) {
    if (!next) {
      if (step === "done") reset();
      setStep("subscribe");
    }
    onOpenChange(next);
  }

  const isSurvey = step === "survey";

  if (step === "done") {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="gap-5 overflow-hidden rounded-3xl border-2 border-bark bg-cream p-6 text-center text-bark shadow-[4px_5px_0_var(--color-bark)] ring-0 sm:max-w-md sm:p-7">
          {/* 축하 장식: 메인 화면의 낙엽 이미지와 색 조각 */}
          <CelebrationDecor />

          <DialogHeader className="relative items-center gap-2 pt-6">
            <span className="grid size-16 place-items-center rounded-full border-2 border-bark bg-leaf shadow-[3px_3px_0_var(--color-bark)]">
              <PartyPopper className="size-8" />
            </span>
            <DialogTitle className="font-paperlogy mt-3 text-2xl font-semibold">
              구독을 축하해요!
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-[#795f55]">
              이제 새로운 카페와 이벤트 소식을
              <br />
              <strong className="font-bold break-all text-bark">
                {getValues("email")}
              </strong>
              로 보내드릴게요.
            </DialogDescription>
          </DialogHeader>

          <p className="relative rounded-2xl border-2 border-dashed border-[#ceb5a0] bg-white/70 px-4 py-3 text-[13px] leading-5 text-[#795f55]">
            좋은 카페, 소중한 사람들과 함께하는 시간이
            <br />더 즐거워지도록 알찬 소식만 골라 보낼게요 ☕
          </p>

          <DialogFooter className="relative sm:justify-center">
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] gap-5 overflow-y-auto rounded-3xl border-2 border-bark bg-cream p-6 text-bark shadow-[4px_5px_0_var(--color-bark)] ring-0 sm:max-w-md sm:p-7">
        <DialogHeader className="items-center gap-2">
          <span className="grid size-12 place-items-center rounded-full border-2 border-bark bg-leaf">
            <BellRing className="size-6" />
          </span>
          <DialogTitle className="font-paperlogy mt-2 text-2xl font-semibold">
            {isSurvey ? "취향을 알려주세요" : "카페 소식 구독하기"}
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-[#795f55]">
            {isSurvey
              ? "더 잘 맞는 카페 소식을 보내드리기 위한 짧은 설문이에요."
              : "새로운 카페와 이벤트 소식을 메일로 받아보세요."}
          </DialogDescription>
        </DialogHeader>

        {!isSurvey && (
          <ul className="space-y-3 border-t border-b border-dashed border-[#ceb5a0] py-6">
            {subscribeNotices.map(({ icon: Icon, title, text }) => (
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
        )}

        <form
          noValidate
          onSubmit={(event) => {
            // 1단계에서 이메일 입력 중 엔터를 치면 설문 단계로 넘어간다.
            if (isSurvey) return handleSubmit(submitSubscription)(event);
            event.preventDefault();
            void goToSurvey();
          }}
          className="grid gap-5"
        >
          {isSurvey ? (
            <>
              <Field
                data-invalid={!!errors.ageGroup}
                className="gap-2 border-t border-dashed border-[#ceb5a0] pt-5"
              >
                <FieldLabel className="font-bold">
                  <span
                    aria-hidden="true"
                    className="mt-1.75 size-1.5 shrink-0 self-start rounded-full bg-autumn"
                  />
                  나이대 <span className="text-autumn">*</span>
                </FieldLabel>
                <Controller
                  name="ageGroup"
                  control={control}
                  render={({ field }) => (
                    <ChoiceChips
                      label="나이대"
                      options={subscribeAgeGroups}
                      value={field.value}
                      onChange={field.onChange}
                      invalid={!!errors.ageGroup}
                    />
                  )}
                />
                <FieldError errors={[errors.ageGroup]} />
              </Field>

              <Field data-invalid={!!errors.source} className="gap-2">
                <FieldLabel className="font-bold">
                  <span
                    aria-hidden="true"
                    className="mt-1.75 size-1.5 shrink-0 self-start rounded-full bg-autumn"
                  />
                  카페조아를 어떻게 알게 되셨나요?{" "}
                  <span className="text-autumn">*</span>
                </FieldLabel>
                <Controller
                  name="source"
                  control={control}
                  render={({ field }) => (
                    <ChoiceChips
                      label="알게 된 경로"
                      options={subscribeSources}
                      value={field.value}
                      onChange={field.onChange}
                      invalid={!!errors.source}
                    />
                  )}
                />
                <FieldError errors={[errors.source]} />
              </Field>

              <Field className="gap-2">
                <FieldLabel className="font-bold">
                  <span
                    aria-hidden="true"
                    className="mt-1.75 size-1.5 shrink-0 self-start rounded-full bg-autumn"
                  />
                  <span>
                    어떤 스타일의 카페를 좋아하세요?{" "}
                    <span className="text-[10px] font-normal whitespace-nowrap text-[#795f55]">
                      복수 선택 가능
                    </span>
                  </span>
                </FieldLabel>
                <Controller
                  name="styles"
                  control={control}
                  render={({ field }) => (
                    <ChoiceChips
                      multiple
                      label="좋아하는 카페 스타일"
                      options={subscribeStyles}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Field>

              <Field className="gap-2">
                <FieldLabel className="font-bold">
                  <span
                    aria-hidden="true"
                    className="mt-1.75 size-1.5 shrink-0 self-start rounded-full bg-autumn"
                  />
                  <span>
                    방문할 때 가장 중요하게 생각하는 것은 무엇인가요?{" "}
                    <span className="text-[10px] font-normal whitespace-nowrap text-[#795f55]">
                      복수 선택 가능
                    </span>
                  </span>
                </FieldLabel>
                <Controller
                  name="priorities"
                  control={control}
                  render={({ field }) => (
                    <ChoiceChips
                      multiple
                      label="카페를 방문할 때 중요하게 생각하는 것"
                      options={subscribePriorities}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Field>

              <Field data-invalid={!!errors.wish} className="gap-2">
                <FieldLabel htmlFor="subscribe-wish" className="font-bold">
                  <span
                    aria-hidden="true"
                    className="mt-1.75 size-1.5 shrink-0 self-start rounded-full bg-autumn"
                  />
                  <span>
                    가장 받고 싶은 정보는 무엇인가요?{" "}
                    <span className="text-[10px] font-normal whitespace-nowrap text-[#795f55]">
                      선택
                    </span>
                  </span>
                </FieldLabel>
                <Input
                  id="subscribe-wish"
                  placeholder="예: 제주 오션뷰 카페, 주말 가족 나들이 카페"
                  aria-invalid={!!errors.wish}
                  className="h-11 rounded-xl border-[#ead9ca] bg-white px-3 focus-visible:border-bark focus-visible:ring-0"
                  {...register("wish")}
                />
                <FieldError errors={[errors.wish]} />
              </Field>

              <DialogFooter className="gap-2 border-t border-dashed border-[#ceb5a0] pt-5 sm:justify-end">
                <Button
                  variant="seed"
                  onClick={() => setStep("subscribe")}
                  className="bg-white text-bark hover:bg-[#fffaf2]"
                >
                  이전
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  variant="seed"
                  className="bg-autumn text-white hover:bg-autumn-dark"
                >
                  <Check className="size-4" />
                  취향 담아 구독 완료
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <Field data-invalid={!!errors.email} className="gap-2">
                <FieldLabel htmlFor="subscribe-email" className="font-bold">
                  이메일 <span className="text-autumn">*</span>
                </FieldLabel>
                <Input
                  id="subscribe-email"
                  type="email"
                  autoComplete="email"
                  placeholder="소식을 받을 이메일을 입력하세요"
                  aria-invalid={!!errors.email}
                  className="h-11 rounded-xl border-[#ead9ca] bg-white px-3 focus-visible:border-bark focus-visible:ring-0"
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>

              <Field data-invalid={!!errors.privacyConsent} className="gap-2">
                <div className="flex items-start gap-2.5">
                  <Controller
                    name="privacyConsent"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="subscribe-privacy-consent"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-invalid={!!errors.privacyConsent}
                        className="mt-0.5 border-[#ceb5a0] bg-white data-checked:border-autumn data-checked:bg-autumn"
                      />
                    )}
                  />
                  <FieldLabel
                    htmlFor="subscribe-privacy-consent"
                    className="items-start text-sm font-normal"
                  >
                    <span className="font-medium text-bark">
                      (필수){" "}
                      <Link
                        href="/privacy"
                        target="_blank"
                        className="text-autumn underline underline-offset-4"
                      >
                        개인정보처리방침
                      </Link>
                      에 동의하고 소식 메일을 받습니다.{" "}
                      <span className="text-autumn">*</span>
                    </span>
                  </FieldLabel>
                </div>
                <FieldError errors={[errors.privacyConsent]} />
              </Field>

              <DialogFooter className="gap-2 border-t border-dashed border-[#ceb5a0] pt-5 sm:justify-end">
                <DialogClose
                  render={
                    <Button
                      variant="seed"
                      className="bg-white text-bark hover:bg-[#fffaf2]"
                    />
                  }
                >
                  다음에 할게요
                </DialogClose>
                <Button
                  variant="seed"
                  onClick={goToSurvey}
                  className="bg-autumn text-white hover:bg-autumn-dark"
                >
                  <BellRing className="size-4" />
                  구독하기
                </Button>
              </DialogFooter>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
