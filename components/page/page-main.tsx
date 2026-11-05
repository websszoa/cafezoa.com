import Link from "next/link";
import Image from "next/image";
import { Images, LayoutList, MapPinned, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MainPage() {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#ff5b20] text-white">
      <div
        className="autumn-background-pattern pointer-events-none absolute inset-0"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <span className="leaf-fall leaf-fall-slow absolute -top-8 left-[4%] aspect-180/165 w-24 overflow-hidden opacity-90 sm:w-36">
          <Image
            src="/images/leaf-maple-yellow.png"
            fill
            sizes="144px"
            alt=""
            className="object-contain"
          />
        </span>
        <span className="leaf-fall leaf-fall-medium absolute top-[12%] right-[5%] aspect-180/165 w-20 overflow-hidden opacity-80 sm:w-32">
          <Image
            src="/images/leaf-maple-red.png"
            fill
            sizes="128px"
            alt=""
            className="object-contain"
          />
        </span>
        <span className="leaf-fall leaf-fall-fast absolute top-[34%] left-[8%] aspect-180/165 w-14 overflow-hidden opacity-55 sm:w-24">
          <Image
            src="/images/leaf-oak-orange.png"
            fill
            sizes="96px"
            alt=""
            className="object-contain"
          />
        </span>
      </div>

      <section className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col items-center px-5 pt-[clamp(4.5rem,10vh,7rem)] text-center">
        <p className="font-paperlogy flex items-center gap-2.5 text-xs font-black tracking-[0.2em] uppercase">
          Cafe curation guide
        </p>
        <h1 className="font-pappin mt-8 text-[clamp(3.5rem,16vw,8.25rem)] leading-[0.84] font-bold -tracking-widest uppercase [text-shadow:5px_5px_0_#c83d12]">
          <span className="text-[#9cff75]">cafe</span>
          <span>zoa</span>
        </h1>
        <p className="font-paperlogy mt-7 text-base leading-6 sm:mt-9 sm:text-xl sm:leading-7">
          좋은 카페, 소중한 사람들과
          <span className="block">전국의 멋진 카페를 한눈에 찾아보세요!</span>
        </p>

        <div
          className="relative z-20 mt-8 grid w-full max-w-xs grid-cols-1 gap-4 sm:mt-10"
          aria-label="카페 보기 방식"
        >
          <Button
            render={<Link href="/map" />}
            nativeButton={false}
            size="lg"
            className="font-paperlogy min-h-14 gap-2 rounded-2xl border-2 border-[#3a241c] bg-[#9cff75] px-3 font-semibold text-[#3a241c] shadow-[4px_5px_0_#3a241c] transition-[box-shadow,background-color] duration-200 ease-out hover:bg-[#8eed68] hover:shadow-[0_0_0_#3a241c]"
          >
            <MapPinned className="size-5" />
            지도 유형으로 보기
          </Button>
          <Button
            render={<Link href="/blog" />}
            nativeButton={false}
            size="lg"
            className="font-paperlogy min-h-14 gap-2 rounded-2xl border-2 border-[#3a241c] bg-[#9cff75] px-3 font-semibold text-[#3a241c] shadow-[4px_5px_0_#3a241c] transition-[box-shadow,background-color] duration-200 ease-out hover:bg-[#8eed68] hover:shadow-[0_0_0_#3a241c]"
          >
            <Newspaper className="size-5" />
            카드 형식으로 보기
          </Button>
          <Button
            render={<Link href="/list" />}
            nativeButton={false}
            size="lg"
            className="font-paperlogy min-h-14 gap-2 rounded-2xl border-2 border-[#3a241c] bg-[#9cff75] px-3 font-semibold text-[#3a241c] shadow-[4px_5px_0_#3a241c] transition-[box-shadow,background-color] duration-200 ease-out hover:bg-[#8eed68] hover:shadow-[0_0_0_#3a241c]"
          >
            <LayoutList className="size-5" />
            목록 형식으로 보기
          </Button>
          <Button
            render={<Link href="/gallery" />}
            nativeButton={false}
            size="lg"
            className="font-paperlogy min-h-14 gap-2 rounded-2xl border-2 border-[#3a241c] bg-[#9cff75] px-3 font-semibold text-[#3a241c] shadow-[4px_5px_0_#3a241c] transition-[box-shadow,background-color] duration-200 ease-out hover:bg-[#8eed68] hover:shadow-[0_0_0_#3a241c]"
          >
            <Images className="size-5" />
            이미지로 보기
          </Button>
        </div>

        <div
          className="relative z-20 mt-8 flex items-center justify-center gap-4"
          aria-label="소셜 로그인"
        >
          <Button
            type="button"
            size="icon"
            aria-label="Google로 로그인"
            className="size-12 rounded-full border-2 border-[#3a241c] bg-white p-0 text-[#3a241c] shadow-[3px_4px_0_#3a241c] transition-[box-shadow,background-color] duration-200 ease-out hover:bg-[#f8f8f8] hover:shadow-[0_0_0_#3a241c]"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
              <path
                fill="#4285F4"
                d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z"
              />
              <path
                fill="#34A853"
                d="M12 22c2.7 0 4.98-.9 6.63-2.42l-3.24-2.53c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.61A10 10 0 0 0 12 22Z"
              />
              <path
                fill="#FBBC05"
                d="M6.39 13.88A6 6 0 0 1 6.08 12c0-.65.11-1.29.31-1.88V7.51H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.49l3.35-2.61Z"
              />
              <path
                fill="#EA4335"
                d="M12 5.99c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.96 5.51l3.35 2.61C7.18 7.75 9.39 5.99 12 5.99Z"
              />
            </svg>
            <span className="sr-only">Google로 로그인</span>
          </Button>

          <Button
            type="button"
            size="icon"
            aria-label="카카오로 로그인"
            className="size-12 rounded-full border-2 border-[#3a241c] bg-[#fee500] p-0 text-[#3a241c] shadow-[3px_4px_0_#3a241c] transition-[box-shadow,background-color] duration-200 ease-out hover:bg-[#f4dc00] hover:shadow-[0_0_0_#3a241c]"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
              <path
                fill="currentColor"
                d="M12 3C6.48 3 2 6.5 2 10.82c0 2.76 1.83 5.18 4.59 6.57l-.93 3.42a.38.38 0 0 0 .58.42l4.08-2.7c.55.07 1.11.11 1.68.11 5.52 0 10-3.5 10-7.82S17.52 3 12 3Z"
              />
            </svg>
            <span className="sr-only">카카오로 로그인</span>
          </Button>
        </div>

        <div className="absolute -bottom-4 left-1/2 aspect-1680/936 w-[min(760px,100vw)] -translate-x-1/2 overflow-hidden sm:-bottom-8">
          <Image
            src="/images/main-hero-autumn.png"
            fill
            alt="가을 야외 카페에서 커피를 즐기는 사람들"
            priority
            sizes="(max-width: 768px) 100vw, 760px"
            className="object-contain drop-shadow-[0_24px_18px_rgba(132,42,13,0.2)]"
          />
        </div>
      </section>
    </main>
  );
}
