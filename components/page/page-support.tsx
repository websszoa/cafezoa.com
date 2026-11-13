"use client";

import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supportTypes, type SupportFormType } from "@/lib/support";
import { supportFormSchema, type SupportFormValues } from "@/lib/validations";

// 마지막 글자에 받침이 있으면 true. ("문의사항이", "불편신고가"처럼 조사를 고를 때 쓴다)
function hasFinalConsonant(word: string) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  return code >= 0 && code <= 11171 && code % 28 !== 0;
}

export function PageSupport({ type }: { type: SupportFormType }) {
  const item = supportTypes[type];
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupportFormValues>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      relatedUrl: "",
      content: "",
      privacyConsent: false,
    },
  });

  // 문의 접수: /api/support에 저장하면 서버가 접수 확인 메일과 관리자 알림 메일을 보낸다.
  async function submitSupport(values: SupportFormValues) {
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, type }),
      });
      if (!response.ok) throw new Error(String(response.status));

      toast.success(
        `${item.title}${hasFinalConsonant(item.title) ? "이" : "가"} 접수되었어요. 입력하신 이메일로 접수 안내를 보내드렸어요.`,
      );
      reset();
    } catch {
      toast.error("문의를 접수하지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  }

  return (
    <div className="bg-cream border-t border-b border-[#ead9ca]">
      <main className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)] lg:gap-16">
        <section aria-labelledby="support-guide-title">
          <p className="font-pappin text-xs font-medium tracking-[0.16em] text-autumn uppercase">
            Guide
          </p>
          <h2
            id="support-guide-title"
            className="font-paperlogy mt-3 text-2xl font-semibold text-bark sm:text-3xl"
          >
            {item.guideTitle}
          </h2>
          <p className="mt-3 text-[15px] leading-7 break-keep text-[#795f55]">
            {item.guideDescription}
          </p>
          <ul className="mt-6 space-y-3 text-sm leading-6 break-keep text-[#795f55]">
            {item.guides.map((guide) => (
              <li key={guide} className="flex gap-2">
                <span
                  aria-hidden="true"
                  className="mt-2.5 size-1.5 shrink-0 rounded-full bg-autumn"
                />
                {guide}
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="support-form-title"
          className="rounded-3xl bg-white p-5 sm:p-8"
        >
          <div className="border-b border-[#ead9ca] pb-6">
            <h2
              id="support-form-title"
              className="font-paperlogy text-2xl font-semibold text-bark sm:text-3xl"
            >
              {item.formTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 break-keep text-[#795f55]">
              {item.formDescription}
            </p>
          </div>

          <form
            noValidate
            onSubmit={handleSubmit(submitSupport)}
            className="mt-7 space-y-6"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="support-name">
                  이름 <span className="text-autumn">*</span>
                </FieldLabel>
                <Input
                  id="support-name"
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  className="h-11 rounded-xl border-[#ead9ca] px-3 focus-visible:border-bark focus-visible:ring-0"
                  placeholder="이름을 입력하세요"
                  {...register("name")}
                />
                <FieldError errors={[errors.name]} />
              </Field>
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="support-email">
                  이메일 <span className="text-autumn">*</span>
                </FieldLabel>
                <Input
                  id="support-email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  className="h-11 rounded-xl border-[#ead9ca] px-3 focus-visible:border-bark focus-visible:ring-0"
                  placeholder="reply@example.com"
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>
            </div>

            <Field data-invalid={!!errors.subject}>
              <FieldLabel htmlFor="support-subject">
                제목 <span className="text-autumn">*</span>
              </FieldLabel>
              <Input
                id="support-subject"
                aria-invalid={!!errors.subject}
                className="h-11 rounded-xl border-[#ead9ca] px-3 focus-visible:border-bark focus-visible:ring-0"
                placeholder={item.subjectPlaceholder}
                {...register("subject")}
              />
              <FieldError errors={[errors.subject]} />
            </Field>

            <Field data-invalid={!!errors.relatedUrl}>
              <FieldLabel htmlFor="support-related-url">
                관련 페이지 주소{" "}
                <span className="font-normal text-[#b3a097]">(선택)</span>
              </FieldLabel>
              <Input
                id="support-related-url"
                type="url"
                inputMode="url"
                aria-invalid={!!errors.relatedUrl}
                className="h-11 rounded-xl border-[#ead9ca] px-3 focus-visible:border-bark focus-visible:ring-0"
                placeholder="https://"
                {...register("relatedUrl")}
              />
              <FieldError errors={[errors.relatedUrl]} />
            </Field>

            <Field data-invalid={!!errors.content}>
              <FieldLabel htmlFor="support-content">
                {item.contentLabel} <span className="text-autumn">*</span>
              </FieldLabel>
              <Textarea
                id="support-content"
                rows={8}
                aria-invalid={!!errors.content}
                className="min-h-48 resize-y rounded-xl border-[#ead9ca] px-3 py-3 leading-6 focus-visible:border-bark focus-visible:ring-0"
                placeholder={item.contentPlaceholder}
                {...register("content")}
              />
              <FieldError errors={[errors.content]} />
            </Field>

            <Field data-invalid={!!errors.privacyConsent} className="gap-2">
              <div className="flex items-start gap-2.5">
                <Controller
                  name="privacyConsent"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="support-privacy-consent"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-invalid={!!errors.privacyConsent}
                      className="mt-0.5 border-[#ead9ca] data-checked:border-autumn data-checked:bg-autumn"
                    />
                  )}
                />
                <FieldLabel
                  htmlFor="support-privacy-consent"
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
                    에 동의합니다. <span className="text-autumn">*</span>
                  </span>
                </FieldLabel>
              </div>
              <FieldError errors={[errors.privacyConsent]} />
            </Field>

            <div className="flex justify-end border-t border-[#ead9ca] pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                variant="sprout"
                className="shrink-0 bg-autumn text-white hover:bg-autumn-dark"
              >
                문의하기
                <Send aria-hidden="true" className="size-4" />
              </Button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
