type DataLayerEntry = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: DataLayerEntry[];
    gtag?: (...args: unknown[]) => void;
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

  if (typeof window.gtag === "function" && !process.env.NEXT_PUBLIC_GTM_ID) {
    window.gtag("event", name, params);
  }
}
