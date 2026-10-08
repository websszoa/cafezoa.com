import { FallbackImage } from "@/components/ui/fallback-image";
import { APP_INSTAGRAM_URL } from "@/lib/constants";

export function CafeGallery({
  cafeName,
  images,
}: {
  cafeName: string;
  images: string[];
}) {
  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {images.map((src, index) => (
          <a
            key={src}
            href={APP_INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            aria-label={`CafeZoa 인스타그램에서 ${cafeName} 공간 이미지 ${index + 1} 보기`}
            className="group relative aspect-4/6 overflow-hidden rounded-2xl border-2 border-[#3a241c] bg-stone-200 outline-none focus-visible:ring-4 focus-visible:ring-[#ff5b20]/40"
          >
            <FallbackImage
              src={src}
              alt={`${cafeName} 공간 ${index + 1}`}
              fill
              showLoadingAnimation
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
