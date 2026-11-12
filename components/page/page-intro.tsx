import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_IMAGE_BASE_URL, APP_NAME, APP_SLOGAN } from "@/lib/constants";
import { introLinks } from "@/lib/menu";

import { GoogleLoginButton } from "@/components/auth/auth-button-google";
import { KakaoLoginButton } from "@/components/auth/auth-button-kakao";
import { NaverLoginButton } from "@/components/auth/auth-button-naver";

export function PageIntro() {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-autumn text-white">
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
            src={`${APP_IMAGE_BASE_URL}images/leaf-maple-yellow.png`}
            fill
            sizes="(min-width: 640px) 144px, 96px"
            alt=""
            className="object-contain"
          />
        </span>
        <span className="leaf-fall leaf-fall-medium absolute top-[12%] right-[5%] aspect-180/165 w-20 overflow-hidden opacity-80 sm:w-32">
          <Image
            src={`${APP_IMAGE_BASE_URL}images/leaf-maple-red.png`}
            fill
            sizes="(min-width: 640px) 128px, 80px"
            alt=""
            className="object-contain"
          />
        </span>
        <span className="leaf-fall leaf-fall-fast absolute top-[34%] left-[8%] aspect-180/165 w-14 overflow-hidden opacity-55 sm:w-24">
          <Image
            src={`${APP_IMAGE_BASE_URL}images/leaf-oak-orange.png`}
            fill
            sizes="(min-width: 640px) 96px, 56px"
            alt=""
            className="object-contain"
          />
        </span>
      </div>

      <section className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col items-center px-5 pt-[clamp(4.5rem,10vh,7rem)] text-center">
        <p className="font-paperlogy flex items-center gap-2.5 text-xs font-black tracking-[0.2em] uppercase">
          Cafe curation guide
        </p>
        <h1 className="font-pappin mt-8 text-[clamp(3.5rem,16vw,8.25rem)] leading-[0.84] font-bold -tracking-widest uppercase [text-shadow:5px_5px_0_var(--color-autumn-dark)]">
          <span className="sr-only">{`${APP_NAME} | ${APP_SLOGAN}`}</span>
          <span aria-hidden="true">
            <span className="text-leaf">cafe</span>
            <span>zoa</span>
          </span>
        </h1>
        <p className="font-nanum font-medium mt-7 leading-6.5">
          좋은 카페, 소중한 사람들과
          <span className="block">전국의 멋진 카페를 한눈에 찾아보세요!</span>
        </p>

        <div
          className="relative z-20 mt-8 grid w-full max-w-xs grid-cols-1 gap-4 sm:mt-9"
          aria-label="카페 보기 방식"
        >
          {introLinks.map(({ href, description, icon: Icon }) => (
            <Button
              key={href}
              render={<Link href={href} />}
              nativeButton={false}
              variant="autumn"
              size="lg"
            >
              <Icon className="size-5" />
              {description}
            </Button>
          ))}
        </div>

        <div
          className="relative z-20 mt-8 flex items-center justify-center gap-4"
          aria-label="소셜 로그인"
        >
          <GoogleLoginButton />
          <KakaoLoginButton />
          <NaverLoginButton />
        </div>

        <div className="absolute -bottom-4 left-1/2 aspect-1680/936 w-[min(760px,100vw)] -translate-x-1/2 overflow-hidden sm:-bottom-8">
          <Image
            src={`${APP_IMAGE_BASE_URL}images/main-hero-autumn.png`}
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
