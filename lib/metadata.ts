import type { Metadata } from "next";
import {
  APP_NAME,
  APP_SHORT_DESCRIPTION,
  APP_SLOGAN,
} from "@/lib/constants";

const defaultImage = {
  url: "/cafezoa.png",
  width: 1536,
  height: 1024,
  alt: `${APP_NAME} - ${APP_SLOGAN}`,
};

export function createPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const socialTitle = `${title} | ${APP_NAME}`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: { "ko-KR": path },
    },
    openGraph: {
      type: "website",
      locale: "ko_KR",
      siteName: APP_NAME,
      url: path,
      title: socialTitle,
      description,
      images: [defaultImage],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: description || APP_SHORT_DESCRIPTION,
      images: [defaultImage.url],
    },
  };
}
