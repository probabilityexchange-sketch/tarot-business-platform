"use client";

import { useEffect } from "react";

const UTM_STORAGE_KEY = "km_utm";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;

export function captureUtm(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (window.sessionStorage.getItem(UTM_STORAGE_KEY)) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const found: Record<string, string> = {};

    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) {
        found[key] = value;
      }
    }

    if (Object.keys(found).length > 0) {
      window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(found));
    }
  } catch {
    // sessionStorage can be unavailable (strict privacy modes); capture is best-effort.
  }
}

export function getStoredUtm(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    const utm: Record<string, string> = {};
    for (const key of UTM_KEYS) {
      const value = (parsed as Record<string, unknown>)[key];
      if (typeof value === "string" && value) {
        utm[key] = value;
      }
    }
    return utm;
  } catch {
    return {};
  }
}

export function useUtmCapture(): void {
  useEffect(() => {
    captureUtm();
  }, []);
}
