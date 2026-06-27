export type MenuItem = {
  id: string;
  label: string;
  href: string;
  icon: string;
};

export const menuItems: MenuItem[] = [
  { id: "cafe", label: "커피", href: "/?panel=coffee", icon: "Coffee" },
  { id: "carrot", label: "김밥", href: "/?panel=carrot", icon: "Carrot" },
  { id: "pizza", label: "피자", href: "/?panel=pizza", icon: "Pizza" },
  { id: "croissant", label: "빵", href: "/?panel=croissant", icon: "Croissant" },
  { id: "bookmark", label: "저장", href: "/bookmark", icon: "Bookmark" },
];
