import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import { GoogleTagManager } from "@next/third-parties/google";
import { LocationProvider } from "@/components/location/location-provider";
import { PageFloat } from "@/components/page/page-float";
import { DialogWelcome } from "@/components/dialog/dialog-welcome";
import { AuthLoginToast } from "@/components/auth/auth-login-toast";

import {
  APP_COPYRIGHT,
  APP_DESCRIPTION,
  APP_ENG_NAME,
  APP_IMAGE_BASE_URL,
  APP_INSTAGRAM_URL,
  APP_KEYWORDS,
  APP_NAME,
  APP_SHORT_DESCRIPTION,
  APP_SITE_URL,
  APP_SLOGAN,
  APP_THREADS_URL,
  GTM_ID,
} from "@/lib/constants";

import { DEFAULT_OG_IMAGE } from "@/lib/metadata";

import "./globals.css";

const nanumSquareNeo = localFont({
  src: [
    {
      path: "../public/fonts/NanumSquareNeo-light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/NanumSquareNeo-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/NanumSquareNeo-bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/NanumSquareNeo-extrabold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../public/fonts/NanumSquareNeo-heavy.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--nanum-square-neo",
  display: "swap",
  preload: true,
  fallback: ["Arial", "sans-serif"],
});

const paperlogy = localFont({
  src: [
    {
      path: "../public/fonts/Paperlogy-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Paperlogy-semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Paperlogy-black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--paperlogy",
  display: "swap",
  preload: true,
  fallback: ["Arial", "sans-serif"],
});

const anyvid = localFont({
  src: "../public/fonts/Anyvid.woff2",
  variable: "--anyvid",
  display: "swap",
  preload: false,
  fallback: ["Arial", "sans-serif"],
});

const pappin = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--pappin",
  display: "swap",
  preload: true,
  fallback: ["Arial", "sans-serif"],
});

const defaultTitle = `${APP_NAME} | ${APP_SLOGAN}`;

export const metadata: Metadata = {
  metadataBase: new URL(APP_SITE_URL),
  applicationName: APP_NAME,
  title: {
    default: defaultTitle,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: APP_KEYWORDS.split(", "),
  authors: [{ name: "webstoryboy", url: APP_SITE_URL }],
  creator: "webstoryboy",
  publisher: APP_NAME,
  category: "카페·여행",
  referrer: "origin-when-cross-origin",
  // canonical은 페이지마다 지정한다. (여기에 두면 지정하지 않은 페이지가 모두 홈의 중복으로 처리됨)
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: `${APP_IMAGE_BASE_URL}icons/favicon.svg`, type: "image/svg+xml" },
    ],
    shortcut: `${APP_IMAGE_BASE_URL}icons/favicon.svg`,
    apple: `${APP_IMAGE_BASE_URL}icons/icon192.png`,
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: APP_SITE_URL,
    siteName: APP_NAME,
    title: defaultTitle,
    description: APP_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: APP_SHORT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
  // 구글 서치콘솔·네이버 서치어드바이저 소유 확인 코드 (배포 환경변수로 넣는다)
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.NAVER_SITE_VERIFICATION
      ? { "naver-site-verification": process.env.NAVER_SITE_VERIFICATION }
      : undefined,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: APP_NAME,
  alternateName: APP_ENG_NAME,
  url: APP_SITE_URL,
  description: APP_DESCRIPTION,
  inLanguage: "ko-KR",
  sameAs: [APP_INSTAGRAM_URL, APP_THREADS_URL],
  copyrightNotice: APP_COPYRIGHT,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={cn(
        "h-full",
        nanumSquareNeo.variable,
        paperlogy.variable,
        anyvid.variable,
        pappin.variable,
      )}
    >
      {/* 구글 태그 매니저. GA4 등 분석 태그는 GTM 안에서 관리한다.
          실제 서비스(Vercel production)에서만 켜서 로컬·미리보기 방문이 통계에 섞이지 않게 한다. */}
      {process.env.VERCEL_ENV === "production" && (
        <GoogleTagManager gtmId={GTM_ID} />
      )}
      <body className="font-nanum flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <LocationProvider>
          {children}
          <PageFloat />
          <DialogWelcome />
          <AuthLoginToast />
        </LocationProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            classNames: {
              title: "font-anyvid",
              description: "font-anyvid",
            },
            style: { boxShadow: "none" },
          }}
        />
      </body>
    </html>
  );
}
