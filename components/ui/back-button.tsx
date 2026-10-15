"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  function handleBack() {
    const cameFromThisSite = document.referrer.startsWith(
      window.location.origin,
    );

    if (cameFromThisSite) {
      router.back();
      return;
    }

    router.push("/blog");
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label="뒤로 가기"
      title="뒤로 가기"
      className="fixed bottom-24 left-5 z-50 grid size-14 cursor-pointer place-items-center rounded-full bg-[#9cff75] text-[#3a241c] transition-transform hover:-translate-y-0.5 sm:bottom-28 sm:left-8 sm:size-16"
    >
      <ArrowLeft className="size-6 sm:size-7" />
    </button>
  );
}
