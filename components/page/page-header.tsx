import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PageHeader({
  icon,
  title,
  description,
  tone = "light",
  titleAs: Title = "h1",
}: {
  icon: ReactNode;
  title: string;
  description: string;
  tone?: "light" | "dark";
  // 제목 태그. 로딩 중에 잠깐 보이는 헤더는 "p"로 써서 페이지에 h1이 두 개 생기지 않게 한다.
  titleAs?: "h1" | "p";
}) {
  return (
    <header className={tone === "dark" ? "bg-autumn" : "bg-cream"}>
      <div className="mx-auto max-w-3xl px-5 py-6 lg:py-10 text-center">
        <div className="my-4 lg:my-8">
          <Button
            render={<Link href="/" />}
            nativeButton={false}
            variant="sprout"
            size="icon"
            aria-label="홈으로 이동"
            className="mx-auto size-14 bg-leaf p-0 text-bark hover:bg-leaf-dark sm:size-20"
          >
            {icon}
          </Button>

          <Title
            className={cn(
              "font-paperlogy mt-3 text-[clamp(2.5rem,6vw,4.25rem)] font-semibold",
              tone === "dark" ? "text-white" : "text-bark",
            )}
          >
            {title}
          </Title>

          <p
            className={cn(
              "mx-auto mt-0 max-w-xl text-sm leading-6 break-keep sm:text-base",
              tone === "dark" ? "text-white" : "text-[#795f55]",
            )}
          >
            {description}
          </p>
        </div>
      </div>
    </header>
  );
}
