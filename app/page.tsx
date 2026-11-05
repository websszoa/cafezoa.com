import type { Metadata } from "next";
import { MainPage } from "@/components/page/page-main";
import { APP_DESCRIPTION, APP_NAME, APP_SLOGAN } from "@/lib/constants";

const title = `${APP_NAME} | ${APP_SLOGAN}`;

export const metadata: Metadata = {
  alternates: { canonical: "/", languages: { "ko-KR": "/" } },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: APP_NAME,
    url: "/",
    title,
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
};

export default function Home() {
  return <MainPage />;
}
