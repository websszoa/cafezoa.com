"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { LocationDistance } from "@/components/location/location-distance";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Armchair,
  AtSign,
  Baby,
  BookOpenCheck,
  Building2,
  Cigarette,
  CircleParking,
  Clock,
  Coffee,
  Eye,
  Globe2,
  MapPin,
  PawPrint,
  Phone,
  ReceiptText,
  Sparkles,
  Star,
  Toilet,
  Users,
  type LucideIcon,
} from "lucide-react";

// 목록 한 줄에 필요한 카페 정보. 서버(page-list.tsx)에서 cafe-basic.json과 cafe-details.json을 합쳐 만든다.
export type ListRow = {
  slug: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  image: string;
  ratings: { label: string; rating: number }[];
  // 카페 이름 아래 아이콘 (주차·스터디·흡연·반려동물 가능 여부)
  indicators: { key: IndicatorKey; label: string; active: boolean }[];
  view: string[];
  services: string[];
  purpose: string[];
  features: string[];
  floors: string[];
  hours: string[];
  closedDays: string;
  prices: { menu: string; price: number | null }[];
  parking: string[];
  seating: string[];
  study: string[];
  smoking: string[];
  pet: string[];
  children: string[];
  restroom: string[];
  phone: string | null;
  website: string | null;
  instagram: string | null;
};

type IndicatorKey = "parking" | "study" | "smoking" | "pet";

const indicatorIcons: Record<IndicatorKey, LucideIcon> = {
  parking: CircleParking,
  study: BookOpenCheck,
  smoking: Cigarette,
  pet: PawPrint,
};

// 표에 넣었다 뺄 수 있는 칸. 번호·카페 칸은 항상 보인다.
// defaultVisible이 true인 칸이 처음 화면(기본값)에 보인다.
const columns: {
  key: string;
  title: string;
  icon: LucideIcon;
  defaultVisible: boolean;
  // 모바일에서는 숨긴다. (평점은 모바일에서 카페 이름 아래에 따로 보여준다)
  desktopOnly?: boolean;
  // 칸 내용(td)에 덧붙일 클래스. (예: 최대 가로값)
  className?: string;
  render: (row: ListRow) => ReactNode;
}[] = [
  {
    key: "rating",
    title: "평점",
    icon: Star,
    defaultVisible: true,
    desktopOnly: true,
    render: (row) =>
      lines(
        row.ratings.map(({ label, rating }) => `${label} ${rating.toFixed(2)}`),
      ),
  },
  {
    key: "view",
    title: "뷰",
    icon: Eye,
    defaultVisible: true,
    render: (row) => lines(row.view),
  },
  {
    key: "services",
    title: "서비스",
    icon: Coffee,
    defaultVisible: true,
    render: (row) => lines(row.services),
  },
  {
    key: "price",
    title: "대표 가격",
    icon: ReceiptText,
    defaultVisible: false,
    render: (row) =>
      lines(
        row.prices.map(
          ({ menu, price }) =>
            `${menu} ${price === null ? "가격 정보 없음" : `${price.toLocaleString()}원`}`,
        ),
      ),
  },
  {
    key: "hours",
    title: "영업시간",
    icon: Clock,
    defaultVisible: true,
    // 최대 200px, 넘치는 줄은 말줄임표(...)로 자른다.
    className: "max-w-[250px]",
    render: (row) => lines([...row.hours, row.closedDays], true),
  },
  {
    key: "purpose",
    title: "추천 목적",
    icon: Users,
    defaultVisible: false,
    render: (row) => lines(row.purpose),
  },
  {
    key: "features",
    title: "공간 특징",
    icon: Sparkles,
    defaultVisible: false,
    render: (row) => lines(row.features),
  },
  {
    key: "floors",
    title: "층",
    icon: Building2,
    defaultVisible: false,
    render: (row) => lines(row.floors),
  },
  {
    key: "parking",
    title: "주차",
    icon: CircleParking,
    defaultVisible: true,
    render: (row) => lines(row.parking),
  },
  {
    key: "seating",
    title: "좌석",
    icon: Armchair,
    defaultVisible: true,
    render: (row) => lines(row.seating),
  },
  {
    key: "study",
    title: "스터디",
    icon: BookOpenCheck,
    defaultVisible: false,
    render: (row) => lines(row.study),
  },
  {
    key: "children",
    title: "아이 동반",
    icon: Baby,
    defaultVisible: false,
    render: (row) => lines(row.children),
  },
  {
    key: "pet",
    title: "반려동물",
    icon: PawPrint,
    defaultVisible: false,
    render: (row) => lines(row.pet),
  },
  {
    key: "smoking",
    title: "흡연",
    icon: Cigarette,
    defaultVisible: false,
    render: (row) => lines(row.smoking),
  },
  {
    key: "restroom",
    title: "화장실",
    icon: Toilet,
    defaultVisible: false,
    render: (row) => lines(row.restroom),
  },
  {
    key: "contact",
    title: "연락처",
    icon: Phone,
    defaultVisible: false,
    render: (row) => contactLinks(row),
  },
];

const defaultVisibleKeys = columns
  .filter((column) => column.defaultVisible)
  .map((column) => column.key);

// 칸 하나에 보여줄 최대 줄 수. 나머지는 상세 페이지에서 볼 수 있다.
const MAX_LINES = 4;

// 칸 안의 여러 줄 텍스트(최대 MAX_LINES줄). 내용이 없으면 null을 돌려줘 칸에 "-"가 표시된다.
// truncate가 true면 칸 너비를 넘치는 줄을 말줄임표(...)로 자른다. (블릿 점은 그대로 보이도록 글자만 자른다)
function lines(items: string[], truncate = false) {
  if (!items.length) return null;
  return (
    <ul className="list-disc space-y-1 pl-4 marker:text-autumn">
      {items.slice(0, MAX_LINES).map((item) => (
        <li key={item}>
          {truncate ? (
            <span title={item} className="block truncate">
              {item}
            </span>
          ) : (
            item
          )}
        </li>
      ))}
    </ul>
  );
}

// 전화·웹사이트·인스타그램 링크. 하나도 없으면 null.
function contactLinks(row: ListRow) {
  const links = [
    row.phone && {
      href: `tel:${row.phone}`,
      label: row.phone,
      icon: Phone,
      external: false,
    },
    row.website && {
      href: row.website,
      label: "웹사이트",
      icon: Globe2,
      external: true,
    },
    row.instagram && {
      href: `https://www.instagram.com/${row.instagram}/`,
      label: `@${row.instagram}`,
      icon: AtSign,
      external: true,
    },
  ].filter(Boolean) as {
    href: string;
    label: string;
    icon: LucideIcon;
    external: boolean;
  }[];

  if (!links.length) return null;

  return (
    <div className="space-y-1">
      {links.map(({ href, label, icon: Icon, external }) => (
        <a
          key={href}
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
          className="flex items-center gap-1 hover:text-autumn hover:underline"
        >
          <Icon aria-hidden="true" className="size-3 shrink-0 text-autumn" />
          {label}
        </a>
      ))}
    </div>
  );
}

// 카페 목록 표. 표 위의 체크박스로 보여줄 칸을 고른다.
export function ListTable({ rows }: { rows: ListRow[] }) {
  const [visibleKeys, setVisibleKeys] = useState<string[]>(defaultVisibleKeys);
  const visibleColumns = columns.filter((column) =>
    visibleKeys.includes(column.key),
  );

  function toggleColumn(key: string, checked: boolean) {
    setVisibleKeys((keys) =>
      checked ? [...keys, key] : keys.filter((item) => item !== key),
    );
  }

  const allKeys = columns.map((column) => column.key);
  const isAll = visibleKeys.length === allKeys.length;
  const isDefault =
    visibleKeys.length === defaultVisibleKeys.length &&
    defaultVisibleKeys.every((key) => visibleKeys.includes(key));

  // 표 위 체크박스: "모두 보기"·"기본"은 묶음 선택, 나머지는 칸 하나씩.
  // 모두 보기를 끄면 기본으로, 기본을 끄면 선택 칸을 모두 비운다.
  const options = [
    {
      id: "all",
      title: "모두 보기",
      checked: isAll,
      onChange: (checked: boolean) =>
        setVisibleKeys(checked ? allKeys : defaultVisibleKeys),
    },
    {
      id: "default",
      title: "기본",
      checked: isDefault,
      onChange: (checked: boolean) =>
        setVisibleKeys(checked ? defaultVisibleKeys : []),
    },
    ...columns.map(({ key, title }) => ({
      id: key,
      title,
      checked: visibleKeys.includes(key),
      onChange: (checked: boolean) => toggleColumn(key, checked),
    })),
  ];

  return (
    <>
      <fieldset className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2.5">
        <legend className="sr-only">표에 보여줄 항목</legend>
        {options.map(({ id, title, checked, onChange }, index) => (
          <div
            key={id}
            className={cn(
              "flex items-center gap-1.5",
              // "기본" 뒤에 구분선을 넣어 묶음 선택과 칸 선택을 나눈다.
              index === 1 && "border-r border-white/40 pr-4",
            )}
          >
            <Checkbox
              id={`list-column-${id}`}
              checked={checked}
              onCheckedChange={onChange}
              className="border-white bg-transparent data-checked:border-white data-checked:bg-white data-checked:text-autumn"
            />
            <Label
              htmlFor={`list-column-${id}`}
              className={cn(
                "cursor-pointer text-[13px] text-white",
                index < 2 ? "font-bold" : "font-medium",
              )}
            >
              {title}
            </Label>
          </div>
        ))}
      </fieldset>

      <div className="overflow-hidden rounded-sm bg-white shadow-[0_16px_35px_rgba(145,75,0,0.12)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-295 border-collapse text-left text-sm">
            <thead className="border-b text-[13px] whitespace-nowrap text-bark">
              <tr>
                <th
                  scope="col"
                  className="hidden px-5 py-3.5 pr-0 text-center sm:table-cell"
                >
                  번호
                </th>
                <th scope="col" className="px-5 py-3.5">
                  카페
                </th>
                {visibleColumns.map(
                  ({ key, title, icon: Icon, desktopOnly }) => (
                    <th
                      key={key}
                      scope="col"
                      className={cn(
                        "px-4 py-3.5",
                        desktopOnly && "hidden sm:table-cell",
                      )}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Icon
                          aria-hidden="true"
                          className="size-3.5 text-autumn"
                        />
                        {title}
                      </span>
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.slug}
                  className={cn(
                    "transition-colors hover:bg-[#fff1da]",
                    index % 2 === 1 && "bg-[#fffaf2]",
                  )}
                >
                  <td className="hidden px-5 py-4 pr-0 align-middle sm:table-cell">
                    <div className="flex min-w-10 flex-col items-center">
                      <span className="font-nanum text-sm text-[#c3957a]">
                        {index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <CafeCell row={row} index={index} />
                  </td>
                  {visibleColumns.map(
                    ({ key, desktopOnly, className, render }) => (
                      <td
                        key={key}
                        className={cn(
                          "font-nanum px-4 py-4 align-top text-sm whitespace-nowrap text-bark",
                          desktopOnly && "hidden sm:table-cell",
                          className,
                        )}
                      >
                        {render(row) ?? "-"}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// 카페 칸: 대표 사진, 이름, 주소·거리, 가능 여부 아이콘, (모바일) 평점.
function CafeCell({ row, index }: { row: ListRow; index: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded">
        <Image
          src={row.image}
          alt={row.name}
          fill
          sizes="80px"
          className="object-cover"
        />
        <span className="absolute top-1 left-1 z-10 flex size-5 items-center justify-center rounded-full bg-autumn text-[11px] font-bold text-white sm:hidden">
          {index + 1}
        </span>
      </div>
      <div className="min-w-0">
        <p className="font-paperlogy truncate text-xl font-semibold text-bark">
          {row.name}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-sm whitespace-nowrap text-bark">
          <MapPin
            aria-hidden="true"
            className="size-3.5 shrink-0 text-autumn"
          />
          {row.address}
          <LocationDistance
            latitude={row.latitude}
            longitude={row.longitude}
            className="ml-1.5 text-xs text-autumn"
          />
        </p>
        <div className="mt-2 flex items-center gap-2">
          {row.indicators.map(({ key, label, active }) => {
            const Icon = indicatorIcons[key];
            return (
              <Icon
                key={key}
                aria-label={label}
                className={cn(
                  "size-3.5",
                  active ? "text-autumn" : "text-stone-300",
                )}
              />
            );
          })}
        </div>
        {row.ratings.length > 0 && (
          <p className="mt-2 flex items-center gap-2 text-[12px] font-bold whitespace-nowrap text-[#795f55] sm:hidden">
            {row.ratings.map(({ label, rating }) => (
              <span key={label} className="inline-flex items-center gap-0.5">
                <Star
                  aria-hidden="true"
                  className="size-3 fill-autumn text-autumn"
                />
                {label} {rating.toFixed(2)}
              </span>
            ))}
          </p>
        )}
      </div>
    </div>
  );
}
