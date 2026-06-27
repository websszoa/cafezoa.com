import { Suspense } from "react";
import InfoPanel from "./info-panel";

export default function InfoPanelWrapper() {
  return (
    <Suspense>
      <InfoPanel />
    </Suspense>
  );
}
