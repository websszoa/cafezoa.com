import { menuItems } from "@/lib/menu";
import NavItem from "./nav-item";
import NavUser from "./nav-user";

export default function NavBar() {
  return (
    <>
      {/* 데스크탑: 왼쪽 사이드바 */}
      <nav className="hidden md:flex flex-col items-center gap-1 w-16 shrink-0 border-r bg-background py-3">
        {/* C 로고 */}
        <div className="mb-2 flex flex-col items-center">
          <div className="relative flex size-10 items-center justify-center rounded bg-gradient-to-br from-[#7f0000] to-[#ef4444]">
            <span className="relative z-10 text-[24px] font-paperlogy font-black leading-none tracking-tighter text-white select-none">
              C
            </span>
          </div>
        </div>
        {menuItems.map((item) => (
          <NavItem key={item.id} item={item} />
        ))}
        {/* 유저 메뉴 */}
        <div className="mt-auto">
          <NavUser />
        </div>
      </nav>

      {/* 모바일: 하단 고정 바 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t bg-background px-2 py-1">
        {menuItems.map((item) => (
          <NavItem key={item.id} item={item} />
        ))}
      </nav>
    </>
  );
}
