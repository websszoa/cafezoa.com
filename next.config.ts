import type { NextConfig } from "next";
import { APP_IMAGE_BASE_URL } from "./lib/constants";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [new URL("**", APP_IMAGE_BASE_URL)],
  },
};

export default nextConfig;
