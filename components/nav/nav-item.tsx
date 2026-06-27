"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import type { MenuItem } from "@/lib/menu";
import {
  Map,
  Search,
  Navigation,
  Coffee,
  Bookmark,
  MoreHorizontal,
  Carrot,
  Pizza,
  Croissant,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Map,
  Search,
  Navigation,
  Coffee,
  Bookmark,
  MoreHorizontal,
  Carrot,
  Pizza,
  Croissant,
};

export default function NavItem({ item }: { item: MenuItem }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const Icon = iconMap[item.icon];

  return (
    <Button
      variant="ghost"
      asChild
      className={cn(
        "flex flex-col h-auto gap-1 rounded-lg px-1 py-2",
        "flex-1 md:flex-none md:w-14",
        isActive && "bg-red-600 text-primary",
      )}
    >
      <Link href={item.href}>
        <Icon className="size-5 shrink-0" />
        <span className="text-[12px] font-nanumNeo leading-none mt-1">
          {item.label}
        </span>
      </Link>
    </Button>
  );
}
