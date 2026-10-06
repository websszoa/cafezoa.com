import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import {
  APP_COPYRIGHT,
  APP_DESCRIPTION,
  APP_ENG_NAME,
  APP_INSTAGRAM_URL,
  APP_KEYWORDS,
  APP_NAME,
  APP_SHORT_DESCRIPTION,
  APP_SITE_URL,
  APP_SLOGAN,
  APP_THREADS_URL,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

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
  variable: "--font-nanum-square-neo-family",
  display: "swap",
  preload: true,
  fallback: ["Arial", "sans-serif"],
});

const paperlogy = localFont({
  src: [
    {
      path: "../public/fonts/paperlogy-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/paperlogy-semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/paperlogy-black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-paperlogy-family",
  display: "swap",
  preload: true,
  fallback: ["Arial", "sans-serif"],
});

const anyvid = localFont({
  src: "../public/fonts/anyvid.woff2",
  variable: "--font-anyvid-family",
  display: "swap",
  preload: false,
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
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [{ url: "/icons/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/icons/favicon.svg",
    apple: "/icons/icon192.png",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: APP_NAME,
    title: defaultTitle,
    description: APP_DESCRIPTION,
    images: [
      {
        url: "/cafezoa.png",
        width: 1536,
        height: 1024,
        alt: `${APP_NAME} - ${APP_SLOGAN}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: APP_SHORT_DESCRIPTION,
    images: ["/cafezoa.png"],
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
        "h-full antialiased",
        nanumSquareNeo.variable,
        paperlogy.variable,
        anyvid.variable,
      )}
    >
      <body className="font-nanum-square-neo flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
