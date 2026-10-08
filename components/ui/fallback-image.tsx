"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { APP_IMAGE_BASE_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

type FallbackImageProps = ImageProps & {
  showLoadingAnimation?: boolean;
};

function githubImageSrcOf(src: ImageProps["src"]) {
  if (typeof src !== "string" || !src.startsWith("/")) return src;
  return new URL(src.replace(/^\/+/, ""), APP_IMAGE_BASE_URL).toString();
}

function jpgFallbackOf(src: ImageProps["src"]) {
  if (typeof src !== "string" || !/\.webp(?:[?#]|$)/i.test(src)) return null;
  return src.replace(/\.webp(?=([?#]|$))/i, ".jpg");
}

export function FallbackImage({
  src,
  alt,
  className,
  showLoadingAnimation = false,
  onLoad,
  onError,
  ...props
}: FallbackImageProps) {
  const [failedSrc, setFailedSrc] = useState<ImageProps["src"] | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<ImageProps["src"] | null>(null);
  const [delayElapsedSrc, setDelayElapsedSrc] = useState<
    ImageProps["src"] | null
  >(null);
  const remoteSrc = githubImageSrcOf(src);
  const fallbackSrc =
    typeof src === "string" && src.startsWith("/")
      ? src
      : jpgFallbackOf(remoteSrc);
  const currentSrc =
    failedSrc === remoteSrc && fallbackSrc ? fallbackSrc : remoteSrc;
  const isReady =
    !showLoadingAnimation ||
    (loadedSrc === currentSrc && delayElapsedSrc === remoteSrc);

  useEffect(() => {
    if (!showLoadingAnimation) return;

    const timerId = window.setTimeout(() => {
      setDelayElapsedSrc(remoteSrc);
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [remoteSrc, showLoadingAnimation]);

  return (
    <>
      <Image
        {...props}
        unoptimized
        src={currentSrc}
        alt={alt}
        className={cn(
          className,
          "transition-opacity duration-300",
          isReady ? "opacity-100" : "opacity-0",
        )}
        onLoad={(event) => {
          setLoadedSrc(currentSrc);
          onLoad?.(event);
        }}
        onError={(event) => {
          if (fallbackSrc && currentSrc !== fallbackSrc) {
            setFailedSrc(remoteSrc);
          }
          onError?.(event);
        }}
      />
      {showLoadingAnimation && (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 grid place-items-center bg-[#eadfd4] transition-opacity duration-300",
            isReady ? "opacity-0" : "opacity-100",
          )}
        >
          <span className="size-8 animate-spin rounded-full border-3 border-white/80 border-t-[#ff5b20]" />
        </span>
      )}
    </>
  );
}
