import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: `404 - 페이지를 찾을 수 없습니다 | ${APP_NAME}`,
  description: "요청하신 페이지를 찾을 수 없습니다.",
};

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="main__container flex flex-col justify-center min-h-screen"
    >
      <div className="flex flex-col items-center justify-center py-12 md:py-20">
        <div className="text-center mb-6" aria-hidden="true">
          <p className="font-nanumNeo text-8xl md:text-9xl text-brand/20 select-none">
            404
          </p>
        </div>

        <div className="text-center mb-8 max-w-md px-4">
          <h1 className="font-nanumNeo text-2xl md:text-3xl text-slate-900 mb-3">
            페이지를 찾을 수 없습니다.<span aria-hidden="true">🥶🙏</span>
          </h1>
          <p className="font-anyvid text-sm text-muted-foreground leading-relaxed">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
          <p className="font-anyvid text-sm text-muted-foreground text-center">
            문제가 지속되면{" "}
            <Link
              href="/contact"
              className="text-brand hover:underline underline-offset-2"
            >
              문의하기
            </Link>
            를 통해 알려주세요.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto px-4 sm:px-0">
          <Button
            size="lg"
            variant="destructive"
            asChild
            className="w-full sm:w-auto"
          >
            <Link href="/">
              <Home className="size-4" aria-hidden="true" />
              홈으로 돌아가기
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Link href="/news">
              <Search className="size-4" aria-hidden="true" />
              소식 보기
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
