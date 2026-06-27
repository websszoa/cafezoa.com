import NavBar from "@/components/nav/nav-bar";
import InfoPanelWrapper from "@/components/panel/info-panel-wrapper";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh overflow-hidden">
      <NavBar />
      <InfoPanelWrapper />
      <main id="main-content" className="flex-1 min-w-0 pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
}
