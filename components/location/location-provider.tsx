"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { DialogLocation } from "@/components/dialog/dialog-location";

// 내 위치 좌표. 로그인 없이 쓰므로 이 브라우저의 localStorage에만 저장한다.
export type UserLocation = {
  latitude: number;
  longitude: number;
  // 위치를 확인한 시각 (ISO 문자열)
  savedAt: string;
};

type LocationStatus = "idle" | "loading" | "denied" | "error";

type LocationContextValue = {
  // 저장된 내 위치. 없으면 null.
  location: UserLocation | null;
  // 위치를 받는 중이거나 실패한 상태 (안내 팝업 문구에 쓴다)
  status: LocationStatus;
  // "내 위치 확인하기": 저장된 위치가 없으면 안내 팝업을 열고, 있으면 위치를 새로 확인한다.
  checkLocation: () => void;
  // 안내 팝업 열기 (예: 위치 없이 "가까운 순"을 고른 경우)
  openDialog: () => void;
};

const STORAGE_KEY = "cafezoa-location";
// 같은 탭에서 저장이 바뀐 것을 알리는 이벤트 (storage 이벤트는 다른 탭에만 온다)
const CHANGE_EVENT = "cafezoa-location-change";

const LocationContext = createContext<LocationContextValue | null>(null);

// localStorage 읽기·쓰기. 사생활 보호 모드 등에서 막혀 있어도 오류 없이 넘어간다.
function readStoredLocation() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredLocation(location: UserLocation) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
  } catch {
    // 저장할 수 없어도 이번 화면에서는 아래 이벤트로 반영한다.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function parseLocation(value: string | null): UserLocation | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as UserLocation;
    return typeof parsed.latitude === "number" &&
      typeof parsed.longitude === "number"
      ? parsed
      : null;
  } catch {
    return null;
  }
}

export function LocationProvider({ children }: { children: ReactNode }) {
  // 서버에서는 위치를 알 수 없으므로 null로 그리고, 브라우저에서 저장값을 읽는다.
  const stored = useSyncExternalStore(
    subscribe,
    readStoredLocation,
    () => null,
  );
  const location = useMemo(() => parseLocation(stored), [stored]);

  const [status, setStatus] = useState<LocationStatus>("idle");
  const [open, setOpen] = useState(false);

  // 브라우저에 현재 위치를 한 번 요청한다. (계속 추적하지 않는다)
  const requestLocation = useCallback((onSuccess?: () => void) => {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        writeStoredLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
          savedAt: new Date().toISOString(),
        });
        setStatus("idle");
        onSuccess?.();
      },
      (error) => {
        setStatus(error.code === error.PERMISSION_DENIED ? "denied" : "error");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  const openDialog = useCallback(() => {
    setStatus("idle");
    setOpen(true);
  }, []);

  const checkLocation = useCallback(() => {
    if (!location) {
      openDialog();
      return;
    }
    requestLocation(() => toast.success("내 위치를 새로 확인했어요."));
  }, [location, openDialog, requestLocation]);

  const value = useMemo(
    () => ({ location, status, checkLocation, openDialog }),
    [location, status, checkLocation, openDialog],
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
      <DialogLocation
        open={open}
        onOpenChange={setOpen}
        status={status}
        onConfirm={() =>
          requestLocation(() => {
            setOpen(false);
            toast.success("내 위치를 켰어요. 카페까지 거리를 보여드릴게요.");
          })
        }
      />
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation은 LocationProvider 안에서 사용해야 합니다.");
  }
  return context;
}
