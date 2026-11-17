import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { APP_IMAGE_BASE_URL, APP_NAME, APP_SLOGAN } from "@/lib/constants";
import { introLinks } from "@/lib/menu";
import { AdminStats } from "@/components/admin/admin-stats";
import { getCafeCoverUrl } from "@/lib/cafe-images";
import { getLatestRating } from "@/lib/ratings";
import { getCafeRegion, getCafeTypeLabel } from "@/lib/utils";
import { ArrowRight, Star } from "lucide-react";

import cafes from "@/data/cafe-basic.json";
import cafeDetails from "@/data/cafe-details.json";

import { GoogleLoginButton } from "@/components/auth/auth-button-google";
import { KakaoLoginButton } from "@/components/auth/auth-button-kakao";
import { NaverLoginButton } from "@/components/auth/auth-button-naver";

// 홈 아래쪽 "인기 카페"에 보여줄 카페 수
const POPULAR_CAFE_COUNT = 8;

// 상세 페이지가 있는 카페 중 네이버 평점이 높은 순. (평점이 같으면 리뷰가 많은 순)
const popularCafes = cafes
  .filter((cafe) => cafe.slug in cafeDetails)
  .map((cafe) => {
    const naver = getLatestRating(cafe.slug, "naver");
    return {
      slug: cafe.slug,
      name: cafe.name,
      label: `${getCafeRegion(cafe.location.address)} ${getCafeTypeLabel(cafe.type[0])}`,
      image: getCafeCoverUrl(cafe.slug),
      rating: naver?.rating ?? null,
      count: naver?.count ?? 0,
    };
  })
  .filter((cafe) => cafe.rating !== null)
  .sort((a, b) => b.rating! - a.rating! || b.count - a.count)
  .slice(0, POPULAR_CAFE_COUNT);

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

      {/* 관리자로 로그인했을 때만 보이는 현황 숫자 */}
      <AdminStats className="absolute top-4 left-4 z-30" />

      <section className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col items-center px-5 pt-18 sm:pt-22 text-center">
        <p className="font-paperlogy flex items-center gap-2.5 text-xs font-black tracking-[0.2em] uppercase">
          Cafe curation guide
        </p>
        <h1 className="font-pappin mt-6 text-[clamp(3.5rem,16vw,8.25rem)] leading-[0.84] font-bold -tracking-widest uppercase [text-shadow:5px_5px_0_var(--color-autumn-dark)] sm:mt-8">
          <span className="sr-only">{`${APP_NAME} | ${APP_SLOGAN}`}</span>
          <span aria-hidden="true">
            <span className="text-leaf">cafe</span>
            <span>zoa</span>
          </span>
        </h1>
        <p className="font-nanum mt-5 leading-5.5 sm:leading-6.5 font-medium break-keep text-sm sm:text-base sm:mt-7">
          좋은 카페, 소중한 사람들과
          <span className="block">전국의 멋진 카페를 한눈에 찾아보세요!</span>
        </p>

        <div
          className="relative z-20 mt-7 grid w-full max-w-xs grid-cols-1 gap-3 sm:mt-9 sm:gap-4"
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
          className="relative z-20 mt-7 flex items-center justify-center gap-4 sm:mt-8"
          aria-label="소셜 로그인"
        >
          <GoogleLoginButton />
          <KakaoLoginButton />
          <NaverLoginButton />
        </div>

        {/* 일러스트는 내용 아래에 이어 붙인다. (화면이 짧은 모바일에서 버튼·로그인 위로 겹치지 않도록)
            내용이 짧으면 mt-auto로 화면 맨 아래에 붙고, 길면 그만큼 아래로 밀려 스크롤된다. (640px 이상은 예전처럼 화면 아래에 겹쳐 깐다) */}
        <div className="mt-auto -mb-4 w-[min(760px,100vw)] shrink-0 pt-6 sm:absolute sm:-bottom-8 sm:left-1/2 sm:mb-0 sm:-translate-x-1/2 sm:pt-0">
          <div className="relative aspect-1680/936">
            <Image
              src={`${APP_IMAGE_BASE_URL}images/main-hero-autumn.png`}
              fill
              alt="가을 야외 카페에서 커피를 즐기는 사람들"
              priority
              sizes="(max-width: 768px) 100vw, 760px"
              className="object-contain drop-shadow-[0_24px_18px_rgba(132,42,13,0.2)]"
            />
          </div>
        </div>
      </section>

      {/* 인기 카페: 첫 화면 아래로 스크롤하면 보인다. 홈에서 카페 상세페이지로 바로 이어지는 길(검색엔진도 따라간다). */}
      <section
        aria-labelledby="popular-cafes"
        className="relative bg-cream px-5 pt-16 pb-24 text-bark sm:pt-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2
              id="popular-cafes"
              className="font-paperlogy text-2xl font-semibold sm:text-3xl"
            >
              지금 인기 있는 카페
            </h2>
            <p className="mt-2 text-sm break-keep text-[#795f55] sm:text-base">
              네이버 평점이 높은 카페를 모았어요.
            </p>
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {popularCafes.map((cafe) => (
              <li key={cafe.slug}>
                <Link
                  href={`/cafe/${cafe.slug}`}
                  className="group block overflow-hidden rounded-2xl bg-white outline-none focus-visible:ring-2 focus-visible:ring-autumn"
                >
                  <span className="relative block aspect-3/4 overflow-hidden bg-stone-200">
                    {/* Next 이미지 최적화를 거치지 않고 GitHub 주소에서 바로 불러온다. (서버 트래픽 절약) */}
                    <Image
                      unoptimized
                      src={cafe.image}
                      alt={`${cafe.name} 대표 사진`}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </span>
                  <span className="block p-3 sm:p-4">
                    <span className="font-paperlogy block truncate text-base font-semibold sm:text-lg">
                      {cafe.name}
                    </span>
                    <span className="mt-1 flex items-center justify-between gap-2 text-xs text-stone-600 sm:text-sm">
                      <span className="truncate">{cafe.label}</span>
                      <span className="flex shrink-0 items-center gap-1 font-bold text-[#795f55]">
                        <Star
                          aria-hidden="true"
                          className="size-3.5 fill-autumn text-autumn"
                        />
                        <span className="sr-only">네이버 평점</span>
                        {cafe.rating!.toFixed(2)}
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-10 text-center">
            <Button
              render={<Link href="/list" />}
              nativeButton={false}
              variant="sprout"
              className="bg-leaf text-bark hover:bg-leaf-dark"
            >
              전체 카페 목록 보기
              <ArrowRight aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
