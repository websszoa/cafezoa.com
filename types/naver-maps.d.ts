declare global {
  interface NaverMapInstance {
    getZoom: () => number;
    panTo: (latlng: unknown) => void;
    setZoom: (zoom: number) => void;
  }

  interface NaverMarkerInstance {
    setPosition: (latlng: unknown) => void;
    setIcon: (icon: { content: string; anchor: unknown }) => void;
  }

  interface Window {
    naver: {
      maps: {
        Map: new (
          element: HTMLElement,
          options: { center: unknown; zoom: number }
        ) => NaverMapInstance;
        LatLng: new (lat: number, lng: number) => unknown;
        Marker: new (options: {
          position: unknown;
          map: unknown;
          title?: string;
          icon?: {
            content: string;
            anchor: unknown;
          };
        }) => NaverMarkerInstance;
        InfoWindow: new (options: {
          borderWidth?: number;
          backgroundColor?: string;
          disableAnchor?: boolean;
          pixelOffset?: unknown;
        }) => {
          setContent: (content: string) => void;
          open: (map: unknown, marker: unknown) => void;
        };
        Event: {
          addListener: (
            target: unknown,
            eventName: string,
            listener: () => void,
          ) => void;
        };
        Point: new (x: number, y: number) => unknown;
      };
    };
  }
}

export {};
