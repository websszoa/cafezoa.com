import type { Metadata } from "next";
import { randomInt } from "node:crypto";
import { GalleryPage } from "@/components/page/page-gallery";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "카페 이미지",
  description: "전국의 개성 있는 카페를 이미지로 살펴보세요.",
};

export default function CafeGalleryPage() {
  return <GalleryPage seed={randomInt(0, 2 ** 30)} />;
}
