import type { Metadata } from "next";
import { MapPage as MapPageView } from "@/components/page/page-map";

export const metadata: Metadata = {
  title: "카페 지도",
  description: "전국의 개성 있는 카페를 지도에서 찾고 비교해 보세요.",
};

export default function MapPage() {
  return <MapPageView />;
}
