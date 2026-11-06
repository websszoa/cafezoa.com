"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { Home, LogOut, Share2, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { APP_NAME, APP_SITE_URL } from "@/lib/constants";

// 아바타를 중심으로 왼쪽~위쪽 90도 부채꼴에 메뉴를 펼친다(화면 밖으로 안 나가게).
const RADIUS = 80;
const START_ANGLE_DEG = 180; // 정왼쪽
const END_ANGLE_DEG = 270; // 정위쪽

type RadialItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
};

export function UserAvatarButton() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    async function loadAvatar(userId: string) {
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", userId)
        .single();
      setAvatarUrl(data?.avatar_url ?? null);
    }

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) loadAvatar(data.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadAvatar(session.user.id);
      } else {
        setAvatarUrl(null);
        setIsOpen(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleShare() {
    setIsOpen(false);
    const shareData = { title: APP_NAME, url: APP_SITE_URL };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // 사용자가 공유 시트를 취소한 경우 등은 무시한다.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareData.url);
      toast.success("링크를 복사했습니다.");
    } catch {
      toast.error("링크 복사에 실패했습니다.");
    }
  }

  const items: RadialItem[] = [
    {
      key: "logout",
      label: "로그아웃",
      icon: LogOut,
      onClick: () => {
        setIsOpen(false);
        const supabase = createClient();
        supabase.auth.signOut().then(() => {
          toast.success("로그아웃되었습니다.");
          router.refresh();
        });
      },
    },
    {
      key: "share",
      label: "공유하기",
      icon: Share2,
      onClick: handleShare,
    },
    {
      key: "home",
      label: "홈으로",
      icon: Home,
      onClick: () => {
        setIsOpen(false);
        router.push("/");
      },
    },
  ];

  // 재생/역재생을 반복할 하나의 타임라인을 마운트 시 한 번만 만든다.
  // (토글마다 새 트윈을 거는 대신 timeline.reverse()로 열던 경로를 그대로 되감는다.)
  useEffect(() => {
    // avatarUrl이 아직 null이거나 StrictMode의 effect 재실행 사이에는
    // 버튼이 DOM에 없거나 ref가 일시적으로 비어 있을 수 있으므로 걸러낸다.
    const elements = itemRefs.current.filter(
      (el): el is HTMLButtonElement => el !== null,
    );
    if (elements.length === 0) return;

    gsap.set(elements, { x: 0, y: 0, scale: 0, opacity: 0 });

    const angleStep = (END_ANGLE_DEG - START_ANGLE_DEG) / (elements.length - 1);
    const tl = gsap.timeline({ paused: true });

    elements.forEach((el, i) => {
      const angle = (START_ANGLE_DEG + angleStep * i) * (Math.PI / 180);
      const x = Math.cos(angle) * RADIUS;
      const y = Math.sin(angle) * RADIUS;

      tl.to(
        el,
        {
          x,
          y,
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: "elastic.out(1, 0.5)",
          easeReverse: true,
        },
        i * 0.05,
      );
    });

    timelineRef.current = tl;
    return () => {
      tl.kill();
    };
    // avatarUrl이 null -> 값으로 바뀌는 순간에야 버튼들이 실제로 DOM에 생기므로,
    // 그 시점에 맞춰 다시 만들어야 refs가 비어있는 빈 타임라인이 되지 않는다.
  }, [avatarUrl]);

  useEffect(() => {
    const tl = timelineRef.current;
    if (!tl) return;
    if (isOpen) {
      tl.play();
    } else if (tl.progress() > 0) {
      tl.reverse();
    }
  }, [isOpen]);

  // 메뉴 바깥 클릭/ESC로 닫는다.
  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!avatarUrl) return null;

  return (
    <div
      ref={containerRef}
      className="fixed z-50"
      style={{
        right: "max(1.25rem, env(safe-area-inset-right))",
        bottom: "max(1.25rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="relative size-12">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              type="button"
              aria-label={item.label}
              onClick={item.onClick}
              className="cursor-pointer absolute inset-0 flex size-12 items-center justify-center rounded-full border-2 border-[#3a241c] bg-white text-[#3a241c] shadow-[3px_4px_0_#3a241c] transition-colors duration-150 ease-out hover:bg-[#9cff75]"
            >
              <Icon className="size-5" />
            </button>
          );
        })}

        <button
          type="button"
          aria-label={isOpen ? "메뉴 닫기" : "내 메뉴 열기"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
          className="group cursor-pointer relative z-10 size-12 overflow-hidden rounded-full border-2 border-[#3a241c] bg-white"
        >
          <Image
            src={avatarUrl}
            alt="내 프로필"
            width={48}
            height={48}
            className="size-full object-cover"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-[#9cff75] opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-10"
          />
        </button>
      </div>
    </div>
  );
}
