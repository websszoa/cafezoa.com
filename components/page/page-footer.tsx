import Link from "next/link";
import {
  ArrowUpRight,
  AtSign,
  Images,
  LayoutList,
  MapPinned,
  MessageCircle,
  Newspaper,
} from "lucide-react";
import {
  APP_COPYRIGHT,
  APP_DESCRIPTION,
  APP_ENG_NAME,
  APP_INSTAGRAM_URL,
  APP_SLOGAN,
  APP_THREADS_URL,
} from "@/lib/constants";

const navigation = [
  { href: "/map", label: "지도", icon: MapPinned },
  { href: "/blog", label: "블로그", icon: Newspaper },
  { href: "/list", label: "목록", icon: LayoutList },
  { href: "/gallery", label: "이미지", icon: Images },
];

export function PageFooter() {
  return (
    <footer className="border-t-2 border-[#3a241c] bg-[#3a241c] text-white mt-10">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-[4fr_6fr]">
        <div>
          <Link
            href="/"
            className="font-paperlogy inline-flex items-center gap-3 text-4xl font-black tracking-[-0.06em] uppercase"
          >
            <span>
              <span className="text-[#9cff75]">cafe</span>zoa
            </span>
          </Link>
          <p className="font-paperlogy mt-3 text-lg text-[#fff3e5]">
            {APP_SLOGAN}
          </p>
          <p className="mt-5 max-w-lg break-keep text-sm leading-6 text-white/65">
            {APP_DESCRIPTION}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:justify-self-end">
          <div>
            <p className="text-xs font-extrabold tracking-[0.16em] text-[#9cff75] uppercase">
              Explore
            </p>
            <nav className="mt-4 space-y-3" aria-label="푸터 메뉴">
              {navigation.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 text-sm font-bold text-white/75 hover:text-white"
                >
                  <Icon className="size-4 text-[#ff5b20]" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-xs font-extrabold tracking-[0.16em] text-[#9cff75] uppercase">
              Social
            </p>
            <div className="mt-4 space-y-3">
              <SocialLink href={APP_INSTAGRAM_URL} icon={<AtSign />}>
                Instagram
              </SocialLink>
              <SocialLink href={APP_THREADS_URL} icon={<MessageCircle />}>
                Threads
              </SocialLink>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <p className="text-xs font-extrabold tracking-[0.16em] text-[#9cff75] uppercase">
              Brand
            </p>
            <p className="mt-4 text-sm font-bold">{APP_ENG_NAME}</p>
            <p className="mt-2 text-xs leading-5 text-white/55">
              좋은 카페를 발견하고
              <br />
              소중한 사람들과 나눠보세요.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>{APP_COPYRIGHT}</p>
          <p>Made for cafe lovers in Korea.</p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 text-sm font-bold text-white/75 hover:text-white"
    >
      <span className="[&_svg]:size-4 [&_svg]:text-[#ff5b20]">{icon}</span>
      {children}
      <ArrowUpRight className="size-3" />
    </a>
  );
}
