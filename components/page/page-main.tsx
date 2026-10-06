import Image from "next/image";
import Link from "next/link";
import { Images, LayoutList, MapPinned, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MainPage() {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#ff5b20] text-white">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <Image
          src="/leaf-maple-yellow.png"
          width={180}
          height={165}
          alt=""
          className="absolute -top-8 left-[4%] w-24 -rotate-12 opacity-90 sm:w-36"
        />
        <Image
          src="/leaf-maple-red.png"
          width={180}
          height={165}
          alt=""
          className="absolute top-[12%] right-[5%] w-20 rotate-12 opacity-80 sm:w-32"
        />
        <Image
          src="/leaf-oak-orange.png"
          width={180}
          height={165}
          alt=""
          className="absolute top-[34%] left-[8%] w-14 rotate-45 opacity-55 sm:w-24"
        />
      </div>

      <section className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col items-center px-5 pt-[clamp(4.5rem,10vh,7rem)] text-center">
        <p className="font-paperlogy flex items-center gap-2.5 text-xs font-black tracking-[0.2em] uppercase">
          Cafe curation guide
        </p>
        <h1 className="font-paperlogy mt-8 -skew-x-6 text-[clamp(3.5rem,16vw,7.25rem)] leading-[0.84] font-black -tracking-widest uppercase [text-shadow:5px_5px_0_#c83d12]">
          <span className="text-[#9cff75]">cafe</span>
          <span>zoa</span>
        </h1>
        <p className="font-paperlogy mt-7 text-base leading-6 sm:mt-9 sm:text-xl sm:leading-7">
          좋은 카페, 소중한 사람들과
          <span className="block">전국의 멋진 카페를 한눈에 찾아보세요</span>
        </p>

        <div
          className="relative z-20 mt-8 grid w-full max-w-xs grid-cols-1 gap-4 sm:mt-10"
          aria-label="카페 보기 방식"
        >
          <Button
            render={<Link href="/map" />}
            nativeButton={false}
            size="lg"
            className="font-paperlogy min-h-14 gap-2 rounded-2xl border-2 border-[#3a241c] bg-[#9cff75] px-3 font-semibold text-[#3a241c] shadow-[4px_5px_0_#3a241c] transition-[box-shadow,background-color] duration-200 ease-out hover:bg-[#8eed68] hover:shadow-[7px_8px_0_#3a241c]"
          >
            <MapPinned className="size-5" />
            지도 유형으로 보기
          </Button>
          <Button
            render={<Link href="/blog" />}
            nativeButton={false}
            size="lg"
            className="font-paperlogy min-h-14 gap-2 rounded-2xl border-2 border-[#3a241c] bg-[#9cff75] px-3 font-semibold text-[#3a241c] shadow-[4px_5px_0_#3a241c] transition-[box-shadow,background-color] duration-200 ease-out hover:bg-[#8eed68] hover:shadow-[7px_8px_0_#3a241c]"
          >
            <Newspaper className="size-5" />
            블로그 형식으로 보기
          </Button>
          <Button
            render={<Link href="/list" />}
            nativeButton={false}
            size="lg"
            className="font-paperlogy min-h-14 gap-2 rounded-2xl border-2 border-[#3a241c] bg-[#9cff75] px-3 font-semibold text-[#3a241c] shadow-[4px_5px_0_#3a241c] transition-[box-shadow,background-color] duration-200 ease-out hover:bg-[#8eed68] hover:shadow-[7px_8px_0_#3a241c]"
          >
            <LayoutList className="size-5" />
            목록 형식으로 보기
          </Button>
          <Button
            render={<Link href="/gallery" />}
            nativeButton={false}
            size="lg"
            className="font-paperlogy min-h-14 gap-2 rounded-2xl border-2 border-[#3a241c] bg-[#9cff75] px-3 font-semibold text-[#3a241c] shadow-[4px_5px_0_#3a241c] transition-[box-shadow,background-color] duration-200 ease-out hover:bg-[#8eed68] hover:shadow-[7px_8px_0_#3a241c]"
          >
            <Images className="size-5" />
            이미지로 보기
          </Button>
        </div>

        <div className="absolute -bottom-4 left-1/2 w-[min(760px,100vw)] -translate-x-1/2 sm:-bottom-8">
          <Image
            src="/main-hero-autumn.png"
            width={1680}
            height={936}
            alt="가을 야외 카페에서 커피를 즐기는 사람들"
            priority
            sizes="(max-width: 768px) 100vw, 760px"
            className="h-auto w-full drop-shadow-[0_24px_18px_rgba(132,42,13,0.2)]"
          />
        </div>
      </section>
    </main>
  );
}
