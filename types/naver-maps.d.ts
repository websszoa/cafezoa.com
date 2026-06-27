declare global {
  interface Window {
    naver: {
      maps: {
        Map: new (
          element: HTMLElement,
          options: { center: unknown; zoom: number }
        ) => unknown;
        LatLng: new (lat: number, lng: number) => unknown;
        Marker: new (options: {
          position: unknown;
          map: unknown;
          icon?: {
            content: string;
            anchor: unknown;
          };
        }) => {
          setPosition: (latlng: unknown) => void;
        };
        Point: new (x: number, y: number) => unknown;
      };
    };
  }
}

export {};
