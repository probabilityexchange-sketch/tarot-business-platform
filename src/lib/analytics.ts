type DataLayerEntry = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: DataLayerEntry[];
  }
}

export function pushEvent(name: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!window.dataLayer) {
    window.dataLayer = [];
  }

  window.dataLayer.push({ event: name, ...params });
}
