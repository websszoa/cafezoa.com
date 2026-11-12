"use client";

import { useEffect, useState } from "react";
import type { DocumentContent } from "@/lib/document";
import { cn } from "@/lib/utils";

export function PageDocument({ content }: { content: DocumentContent }) {
  const [activeId, setActiveId] = useState<string>(content.sections[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-20% 0px -75% 0px" },
    );

    content.sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [content]);

  return (
    <main className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[240px_1fr] lg:gap-16">
      <nav
        aria-label={`${content.title} 목차`}
        className="hidden lg:sticky lg:top-8 lg:block lg:self-start"
      >
        <p className="font-pappin text-xs font-medium tracking-[0.16em] text-autumn uppercase">
          Contents
        </p>
        <ol className="mt-4 space-y-1 border-l-2 border-bark/15">
          {content.sections.map(({ id, title }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={() => setActiveId(id)}
                aria-current={activeId === id ? "location" : undefined}
                className={cn(
                  "-ml-0.5 block border-l-2 py-1.5 pl-4 text-sm transition-colors",
                  activeId === id
                    ? "border-autumn font-semibold text-autumn"
                    : "border-transparent text-bark/70 hover:border-autumn hover:text-bark",
                )}
              >
                {title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="space-y-14">
        {content.sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-title`}
            className="scroll-mt-8 lg:last:pb-50"
          >
            <h2
              id={`${section.id}-title`}
              className="font-paperlogy text-2xl font-semibold text-bark"
            >
              {section.title}
            </h2>
            <div className="mt-4 space-y-3 text-[15px] leading-7 break-keep text-[#795f55]">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {section.bullets && (
              <ul className="mt-4 space-y-2 text-[15px] leading-7 break-keep text-[#795f55]">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <span
                      aria-hidden="true"
                      className="mt-3 size-1.5 shrink-0 rounded-full bg-autumn"
                    />
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
