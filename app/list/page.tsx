import type { Metadata } from "next";
import { ListPage } from "@/components/page/page-list";

export const metadata: Metadata = {
  title: "카페 목록",
  description: "전국의 개성 있는 카페를 목록 형식으로 살펴보세요.",
};

export default function CafeListPage() {
  return <ListPage />;
}
