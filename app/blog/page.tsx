import type { Metadata } from "next";
import { BlogPage as BlogPageView } from "@/components/page/page-blog";

export const metadata: Metadata = {
  title: "카페 블로그",
  description:
    "공간, 전망, 메뉴와 이용 정보로 살펴보는 카페조아의 카페 가이드입니다.",
};

export default function BlogPage() {
  return <BlogPageView />;
}
