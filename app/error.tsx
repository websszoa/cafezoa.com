"use client";

import Link from "next/link";
import { Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <main id="main-content" className="main__container flex flex-col justify-center min-h-screen">
      <div className="flex flex-col items-center justify-center py-12 md:py-20">
        <div className="text-center mb-6" aria-hidden="true">
          <p className="font-paperlogy font-black uppercase text-6xl md:text-8xl text-brand/20">
            ERROR
          </p>
        </div>
        <div className="text-center mb-8 max-w-md px-4">
          <h1 className="font-nanumNeo text-2xl md:text-3xl text-slate-900 mb-3">
            오류가 발생했습니다.<span aria-hidden="true">🥶🙏</span>
          </h1>
          <p className="font-anyvid text-sm text-muted-foreground leading-relaxed">
            예상치 못한 오류가 발생했습니다.
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
          {error.message && (
            <div className="mt-6 p-3 border rounded" role="alert">
              <p className="font-nanumNeo text-xs text-muted-foreground wrap-break-word">
                {error.message}
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto px-4 sm:px-0">
          <Button onClick={reset} variant="destructive" size="lg">
            <RefreshCw className="size-4" aria-hidden="true" />
            다시 시도
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <Home className="size-4" aria-hidden="true" />
              홈으로 돌아가기
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
