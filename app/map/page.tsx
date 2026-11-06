import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import PageMap from "@/components/page/page-map";

export const metadata: Metadata = createPageMetadata({
  title: "카페 지도",
  description: "전국의 개성 있는 카페를 지도에서 찾고 비교해 보세요.",
  path: "/map",
});

export default function MapPage() {
  return <PageMap />;
}
