import { APP_IMAGE_BASE_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

// 축하 팝업 장식: 메인 화면에서 쓰는 낙엽 이미지 위치·회전
const celebrationLeaves = [
  { src: "leaf-maple-yellow.png", className: "-top-2 -left-3 -rotate-12" },
  { src: "leaf-maple-red.png", className: "top-6 -right-4 rotate-[24deg]" },
  { src: "leaf-oak-orange.png", className: "-bottom-3 left-6 rotate-45 w-10" },
];

// 축하 팝업 장식: 흩뿌린 색 조각
const celebrationDots = [
  "top-5 left-1/3 size-2 bg-autumn",
  "top-10 right-1/4 size-1.5 bg-leaf-dark",
  "top-24 left-8 size-1.5 bg-[#7d16ed]",
  "top-16 right-12 size-2 bg-[#fee500]",
  "bottom-16 right-8 size-2 bg-autumn",
  "bottom-24 left-1/4 size-1.5 bg-leaf-dark",
];

// 축하 팝업(구독 완료, 첫 가입) 배경 장식. DialogContent 안에 넣고, 내용은 relative로 위에 둔다.
export function CelebrationDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {celebrationLeaves.map(({ src, className }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={className}
          src={`${APP_IMAGE_BASE_URL}images/${src}`}
          alt=""
          className={cn("absolute w-14 opacity-90", className)}
        />
      ))}
      {celebrationDots.map((className) => (
        <span
          key={className}
          className={cn("absolute rounded-full", className)}
        />
      ))}
    </div>
  );
}
