import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-cream px-5 text-center text-[#191919]">
      <div>
        <div className="mx-auto grid size-20 place-items-center rounded-full border-2 border-bark bg-white text-autumn shadow-[2px_2px_0_var(--color-bark)]">
          <Compass className="size-9" />
        </div>

        <h1 className="font-paperlogy mt-4 text-[clamp(1.75rem,5vw,2.75rem)] font-semibold text-bark">
          페이지를 찾을 수 없어요!
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#795f55] sm:text-base">
          주소가 바뀌었거나 삭제된 페이지예요.
          <br />
          아래에서 원하는 카페 정보를 찾아보세요.
        </p>

        <Button
          render={<Link href="/" />}
          nativeButton={false}
          variant="sprout"
          className="mt-8 bg-autumn text-white hover:bg-autumn-dark"
        >
          <Home className="size-4" />
          홈으로 이동
        </Button>
      </div>
    </main>
  );
}
