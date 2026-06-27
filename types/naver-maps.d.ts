declare global {
  interface Window {
    naver: {
      maps: {
        Map: new (
          element: HTMLElement,
          options: { center: unknown; zoom: number }
        ) => unknown;
        LatLng: new (lat: number, lng: number) => unknown;
      };
    };
  }
}

export {};
