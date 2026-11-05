import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // 카카오 프로필 이미지는 http로 내려오는 경우가 있어 http도 함께 허용한다.
      {
        protocol: "http",
        hostname: "**.kakaocdn.net",
      },
      {
        protocol: "https",
        hostname: "**.kakaocdn.net",
      },
    ],
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
