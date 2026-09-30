"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AtSign,
  Armchair,
  Baby,
  Building2,
  Car,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  ExternalLink,
  Eye,
  Globe,
  Laptop,
  MapPin,
  Phone,
  Star,
  Toilet,
  Cigarette,
  X,
} from "lucide-react";

import type { Cafe } from "@/lib/cafes";

export default function SideDetailPanel({
  cafe,
  onClose,
}: {
  cafe: Cafe;
  onClose: () => void;
}) {
  const images = [cafe.images.cover, ...cafe.images.gallery].filter(
    (image): image is string => Boolean(image),
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxImageIndex, setLightboxImageIndex] = useState<number | null>(
    null,
  );
  const currentImage = images[currentImageIndex];

  function showPreviousImage() {
    setCurrentImageIndex((index) =>
      index === 0 ? images.length - 1 : index - 1,
    );
  }

  function showNextImage() {
    setCurrentImageIndex((index) => (index + 1) % images.length);
  }

  function showPreviousLightboxImage() {
    setLightboxImageIndex((index) =>
      index === null || index === 0 ? images.length - 1 : index - 1,
    );
  }

  function showNextLightboxImage() {
    setLightboxImageIndex((index) =>
      index === null ? 0 : (index + 1) % images.length,
    );
  }

  return (
    <aside
      className="fixed inset-0 z-40 overflow-y-auto bg-sidebar md:static md:z-auto md:w-100 md:shrink-0 md:border-r"
      aria-label={`${cafe.name} 상세 정보`}
    >
      <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/95 px-5 backdrop-blur">
        <span className="font-nanum-neo text-sm">카페 상세 정보</span>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={onClose}
          aria-label="상세 정보 닫기"
          className="rounded-full"
        >
          <X aria-hidden="true" />
        </Button>
      </div>

      <div className="p-5">
        {currentImage ? (
          <div className="group relative overflow-hidden rounded-2xl bg-muted">
            {/* 원본 이미지 비율을 그대로 사용하기 위해 img 요소를 사용합니다. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImage}
              alt={`${cafe.name} 사진 ${currentImageIndex + 1}`}
              className="block h-auto w-full"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPreviousImage}
                  aria-label="이전 이미지"
                  className="absolute left-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity hover:bg-black/75 focus-visible:opacity-100 group-hover:opacity-100"
                >
                  <ChevronLeft className="size-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={showNextImage}
                  aria-label="다음 이미지"
                  className="absolute right-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity hover:bg-black/75 focus-visible:opacity-100 group-hover:opacity-100"
                >
                  <ChevronRight className="size-5" aria-hidden="true" />
                </button>
                <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2 py-1 font-anyvid text-xs text-white">
                  {currentImageIndex + 1} / {images.length}
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
            <Coffee className="size-7" aria-hidden="true" />
          </div>
        )}
        <p className="mt-5 font-anyvid text-xs font-semibold tracking-[0.14em] text-brand">
          {cafe.tags[0]}
        </p>
        <h2 className="mt-1 font-nanum-neo text-2xl leading-snug">
          {cafe.name}
        </h2>
        <p className="mt-2 font-anyvid text-sm leading-6 text-muted-foreground">
          {cafe.description}
        </p>

        <div className="mt-4 grid gap-2.5 rounded-2xl border bg-card p-4 font-anyvid text-sm">
          <InfoRow icon={MapPin}>
            <a
              href={`https://map.naver.com/p/search/${encodeURIComponent(cafe.address)}`}
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              {cafe.address}
            </a>
          </InfoRow>
          <InfoRow icon={Clock}>{cafe.openingHours}</InfoRow>
          <InfoRow icon={Phone}>
            <a
              href={`tel:${cafe.phone}`}
              className="hover:text-brand hover:underline"
            >
              {cafe.phone}
            </a>
          </InfoRow>
          <InfoRow icon={Car}>{cafe.parking}</InfoRow>
          {cafe.website && (
            <InfoRow icon={Globe}>
              <a
                href={cafe.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-brand hover:underline"
              >
                웹사이트
                <ExternalLink className="size-3" aria-hidden="true" />
              </a>
            </InfoRow>
          )}
          {cafe.instagram && (
            <InfoRow icon={AtSign}>
              <a
                href={cafe.instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-brand hover:underline"
              >
                인스타그램
                <ExternalLink className="size-3" aria-hidden="true" />
              </a>
            </InfoRow>
          )}
        </div>

        <DetailSection title="평점">
          <div className="grid grid-cols-2 gap-2">
            {cafe.ratings.map((rating) => (
              <a
                key={rating.source}
                href={getRatingUrl(rating.source, cafe.name)}
                target="_blank"
                rel="noreferrer"
                aria-label={`${cafe.name} ${rating.source} 리뷰 보기`}
                className="rounded-xl bg-muted p-3 transition-colors hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                <p className="font-anyvid text-xs text-muted-foreground">
                  {rating.source}
                </p>
                <p className="mt-1 flex items-center gap-1 font-nanum-neo text-sm">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  {rating.rating}
                </p>
                <p className="mt-1 flex items-center justify-between gap-2 font-anyvid text-xs text-muted-foreground">
                  <span>리뷰 {rating.reviewCount.toLocaleString()}개</span>
                  <span className="text-muted-foreground/60">
                    {rating.date} 기준
                  </span>
                </p>
              </a>
            ))}
          </div>
        </DetailSection>

        <DetailSection title="공간·이용 안내">
          <div className="grid gap-2.5 rounded-2xl border bg-card p-4 font-anyvid text-sm">
            <InfoRow icon={Eye}>{cafe.views.join(" · ")}</InfoRow>
            <InfoRow icon={Building2}>{cafe.floors.join(" · ")}</InfoRow>
            <InfoRow icon={Armchair}>{cafe.seating.join(" · ")}</InfoRow>
            <InfoRow icon={Laptop}>{cafe.study.join(" · ")}</InfoRow>
            <InfoRow icon={Toilet}>{cafe.restroom.join(" · ")}</InfoRow>
            <InfoRow icon={Baby}>{cafe.children.join(" · ")}</InfoRow>
            <InfoRow icon={Cigarette}>{cafe.smoking.join(" · ")}</InfoRow>
          </div>
        </DetailSection>
        {images.length > 0 && (
          <DetailSection title="사진 갤러리">
            <div className="grid grid-cols-2 gap-2">
              {images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setLightboxImageIndex(index)}
                  aria-label={`${cafe.name} 사진 ${index + 1} 크게 보기`}
                  className="aspect-square overflow-hidden rounded-xl bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={`${cafe.name} 갤러리 사진 ${index + 1}`}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </button>
              ))}
            </div>
          </DetailSection>
        )}
      </div>

      {lightboxImageIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${cafe.name} 사진 갤러리`}
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxImageIndex(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImageIndex(null)}
            aria-label="갤러리 닫기"
            className="absolute right-4 top-4 z-10 flex size-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="size-6" aria-hidden="true" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showPreviousLightboxImage();
                }}
                aria-label="이전 이미지"
                className="absolute left-4 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronLeft className="size-7" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showNextLightboxImage();
                }}
                aria-label="다음 이미지"
                className="absolute right-4 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronRight className="size-7" aria-hidden="true" />
              </button>
            </>
          )}

          <div
            className="flex max-h-full max-w-full flex-col items-center gap-3"
            onClick={(event) => event.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[lightboxImageIndex]}
              alt={`${cafe.name} 크게 본 사진 ${lightboxImageIndex + 1}`}
              className="max-h-[calc(100dvh-6rem)] max-w-[calc(100vw-2rem)] object-contain"
            />
            <span className="font-anyvid text-xs text-white">
              {lightboxImageIndex + 1} / {images.length}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}

function getRatingUrl(source: "네이버" | "구글", cafeName: string) {
  const query = encodeURIComponent(cafeName);

  return source === "네이버"
    ? `https://map.naver.com/p/search/${query}`
    : `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function InfoRow({
  icon: Icon,
  children,
}: {
  icon: typeof MapPin;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 text-muted-foreground">
      <Icon className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
      <span className="leading-5">{children}</span>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <h3 className="mb-2.5 font-nanum-neo text-sm">{title}</h3>
      {children}
    </section>
  );
}
