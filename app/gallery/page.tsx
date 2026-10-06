import type { Metadata } from "next";
import { GalleryPage } from "@/components/page/page-gallery";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "카페 이미지",
  description: "전국의 개성 있는 카페를 이미지로 살펴보세요.",
  path: "/gallery",
});

export default function CafeGalleryPage() {
  return <GalleryPage seed={20261007} />;
}
