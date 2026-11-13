import type { MetadataRoute } from "next";
import { APP_SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // API·로그인 콜백은 검색 결과에 나올 필요가 없다.
      disallow: ["/api/", "/auth/"],
    },
    sitemap: `${APP_SITE_URL}/sitemap.xml`,
    host: APP_SITE_URL,
  };
}
