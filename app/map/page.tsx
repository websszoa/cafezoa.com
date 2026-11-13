import type { Metadata } from "next";
import { PageMap } from "@/components/page/page-map";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "카페 지도",
  description:
    "내 주변과 전국의 카페를 지도에서 한눈에 확인하고, 취향에 맞는 카페를 찾아보세요!",
  path: "/map",
});

export default function Map() {
  return <PageMap />;
}
