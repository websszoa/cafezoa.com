import sharp from "sharp";
import { APP_IMAGE_BASE_URL } from "@/lib/constants";

import cafeDetails from "@/data/cafe-details.json";

// 카카오톡·페이스북·X 미리보기에 맞는 가로형(1200×630) JPG 대표 이미지.
// 원본 사진은 세로형(960×1280) webp라서 가운데를 기준으로 잘라 JPG로 바꾼다.
// (next/og의 ImageResponse는 webp를 읽지 못해 sharp로 변환한다.)
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";
export const alt = "카페 대표 전경";

export function generateStaticParams() {
  return Object.keys(cafeDetails).map((slug) => ({ slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const response = await fetch(`${APP_IMAGE_BASE_URL}cafe/${slug}-02.webp`);
  const source = Buffer.from(await response.arrayBuffer());

  const image = await sharp(source)
    .resize(size.width, size.height, { fit: "cover", position: "centre" })
    .jpeg({ quality: 82 })
    .toBuffer();

  return new Response(new Uint8Array(image), {
    headers: { "Content-Type": contentType },
  });
}
