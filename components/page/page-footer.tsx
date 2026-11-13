import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ADMIN_EMAIL,
  ADMIN_PHONE,
  APP_COPYRIGHT,
  APP_DESCRIPTION,
  APP_SLOGAN,
} from "@/lib/constants";
import { footerLinks } from "@/lib/menu";

type Tone = "light" | "dark";

export function PageFooter({ tone = "dark" }: { tone?: Tone }) {
  const isDark = tone === "dark";

  return (
    <footer
      className={cn("", isDark ? "bg-bark text-white" : "bg-cream text-bark")}
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-[4fr_6fr]">
        <div>
          <Link
            href="/"
            className="font-pappin -mt-1 inline-flex items-center gap-1 text-4xl font-extrabold -tracking-widest uppercase"
          >
            <span>
              <span className={isDark ? "text-leaf" : "text-autumn"}>cafe</span>
              zoa
            </span>
          </Link>
          <p
            className={cn(
              "text-[15px] mt-2",
              isDark ? "text-cream" : "text-black font-medium",
            )}
          >
            {APP_SLOGAN}
          </p>
          <p
            className={cn(
              "mt-2 max-w-lg text-sm leading-6 break-keep font-light",
              isDark ? "text-white/60" : "text-bark font-medium",
            )}
          >
            {APP_DESCRIPTION}
          </p>

          <div
            className={cn(
              "mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5",
              isDark ? "border-white/10" : "border-bark",
            )}
          >
            <a
              href={`tel:${ADMIN_PHONE.replaceAll("-", "")}`}
              aria-label={`대표번호 ${ADMIN_PHONE}로 전화하기`}
              className={cn(
                "flex items-center gap-2 text-sm transition-colors",
                isDark
                  ? "text-white/65 hover:text-white"
                  : "text-bark font-medium hover:underline underline-offset-3",
              )}
            >
              <span className="text-xs">대표번호</span>
              <span
                className={cn(
                  "text-xs",
                  isDark ? "text-white/85" : "text-bark",
                )}
              >
                {ADMIN_PHONE}
              </span>
            </a>

            <a
              href={`mailto:${ADMIN_EMAIL}`}
              aria-label={`이메일 문의 ${ADMIN_EMAIL}로 메일 보내기`}
              className={cn(
                "flex items-center gap-2 text-sm transition-colors",
                isDark
                  ? "text-white/65 hover:text-white"
                  : "text-bark font-medium hover:underline underline-offset-3",
              )}
            >
              <span className="text-xs">이메일 문의</span>
              <span
                className={cn(
                  "text-xs",
                  isDark ? "text-white/85" : "text-bark/85",
                )}
              >
                {ADMIN_EMAIL}
              </span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:justify-self-end">
          {footerLinks.map(({ title, label, links }) => (
            <div key={title}>
              <p
                className={cn(
                  "font-pappin text-xs font-medium tracking-[0.16em] uppercase",
                  isDark ? "text-leaf" : "text-autumn",
                )}
              >
                {title}
              </p>
              <nav className="mt-4 space-y-3" aria-label={label}>
                {links.map(({ href, label, icon: Icon, ...link }) => (
                  <Link
                    key={href}
                    href={href}
                    {...("external" in link && {
                      target: "_blank",
                      rel: "noopener noreferrer",
                    })}
                    className={cn(
                      "flex items-center gap-2 text-sm",
                      isDark
                        ? "text-white/75 hover:text-white"
                        : "text-bark hover:text-black",
                    )}
                  >
                    <Icon className="size-4 text-autumn" />
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </div>

      <div
        className={
          isDark ? "border-t border-white/15" : "border-t border-bark/15"
        }
      >
        <div
          className={cn(
            "mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-center text-xs sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:text-left",
            isDark ? "text-white/45" : "text-bark",
          )}
        >
          <p>{APP_COPYRIGHT}</p>
          <p>Made for cafe lovers in Korea.</p>
        </div>
      </div>
    </footer>
  );
}
