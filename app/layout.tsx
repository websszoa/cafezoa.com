import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import {
  APP_DESCRIPTION,
  APP_KEYWORDS,
  APP_NAME,
  APP_SITE_URL,
  APP_SLOGAN,
} from "@/lib/constants";

const anyvid = localFont({
  variable: "--font-anyvid",
  display: "swap",
  preload: false,
  src: [
    { path: "../public/fonts/anyvid.woff2", weight: "400", style: "normal" },
  ],
});

const nanumSquare = localFont({
  variable: "--font-nanumNeo",
  display: "optional",
  preload: false,
  src: [
    {
      path: "../public/fonts/nanum-square-neo.woff2",
      weight: "400",
      style: "normal",
    },
  ],
});

const paperlogy = localFont({
  variable: "--font-paperlogy",
  display: "optional",
  preload: false,
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
});

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_NAME}`,
    default: `${APP_NAME} | ${APP_SLOGAN}`,
  },
  description: APP_DESCRIPTION,
  keywords: APP_KEYWORDS,
  authors: [{ name: "webstoryboy", url: "https://webstoryboy.com" }],
  metadataBase: new URL(APP_SITE_URL),
  alternates: { canonical: APP_SITE_URL },
  icons: {
    icon: [
      { url: "/icons/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },

  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: APP_SITE_URL,
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [
      {
        url: `${APP_SITE_URL}/cafezoa.webp`,
        width: 1200,
        height: 800,
        alt: `${APP_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@cafezoa_official",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [`${APP_SITE_URL}/cafezoa.webp`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={cn(
        "h-full",
        anyvid.variable,
        nanumSquare.variable,
        paperlogy.variable,
      )}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
