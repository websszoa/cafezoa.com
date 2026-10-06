"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CafeGallery({
  cafeName,
  images,
}: {
  cafeName: string;
  images: string[];
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) =>
          current === null
            ? null
            : (current - 1 + images.length) % images.length,
        );
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((current) =>
          current === null ? null : (current + 1) % images.length,
        );
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, images.length]);

  const showPrevious = () => {
    setActiveIndex((current) =>
      current === null ? null : (current - 1 + images.length) % images.length,
    );
  };

  const showNext = () => {
    setActiveIndex((current) =>
      current === null ? null : (current + 1) % images.length,
    );
  };

  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-7">
        {images.map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`${cafeName} 공간 이미지 ${index + 1} 크게 보기`}
            className={`relative overflow-hidden rounded-2xl border-2 border-[#3a241c] bg-stone-200 shadow-[6px_7px_0_#3a241c] outline-none focus-visible:ring-4 focus-visible:ring-[#ff5b20]/40 ${
              index === 0
                ? "col-span-2 aspect-16/10 md:row-span-2 md:aspect-auto"
                : "aspect-4/3"
            }`}
          >
            <Image
              src={src}
              alt={`${cafeName} 공간 ${index + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {activeIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${cafeName} 이미지 크게 보기`}
          className="fixed inset-0 z-100 flex items-center justify-center bg-[#1d120e]/95 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setActiveIndex(null)}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setActiveIndex(null)}
            aria-label="라이트박스 닫기"
            className="absolute top-4 right-4 z-10 rounded-full bg-white text-[#3a241c] shadow-lg hover:bg-[#9cff75] sm:top-7 sm:right-7"
          >
            <X className="size-5" />
          </Button>

          {images.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(event) => {
                event.stopPropagation();
                showPrevious();
              }}
              aria-label="이전 이미지"
              className="absolute left-3 z-10 rounded-full bg-white text-[#3a241c] shadow-lg hover:bg-[#9cff75] sm:left-7"
            >
              <ChevronLeft className="size-6" />
            </Button>
          )}

          <div
            className="relative h-[min(78vh,56rem)] w-[min(86vw,80rem)] overflow-hidden rounded-3xl border-2 border-white/70 bg-black shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={images[activeIndex]}
              alt={`${cafeName} 공간 ${activeIndex + 1}`}
              fill
              priority
              sizes="90vw"
              className="object-contain"
            />
            <p className="absolute right-4 bottom-4 rounded-full bg-black/65 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
              {activeIndex + 1} / {images.length}
            </p>
          </div>

          {images.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(event) => {
                event.stopPropagation();
                showNext();
              }}
              aria-label="다음 이미지"
              className="absolute right-3 z-10 rounded-full bg-white text-[#3a241c] shadow-lg hover:bg-[#9cff75] sm:right-7"
            >
              <ChevronRight className="size-6" />
            </Button>
          )}
        </div>
      )}
    </>
  );
}
