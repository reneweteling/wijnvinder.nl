import type { WineProfileData } from "@/lib/types";

// Cached cookie reader for useSyncExternalStore.
// Parses only when the raw cookie string changes, so Object.is comparisons
// in useSyncExternalStore return the same reference across renders.
let lastCookieString: string | null = null;
let cachedProfile: WineProfileData | null = null;

export function getProfileSnapshot(): WineProfileData | null {
  if (typeof document === "undefined") return null;
  const current = document.cookie;
  if (current === lastCookieString) return cachedProfile;

  lastCookieString = current;
  const match = current
    .split("; ")
    .find((row) => row.startsWith("wine-profile="));
  if (!match) {
    cachedProfile = null;
    return null;
  }
  try {
    const raw = decodeURIComponent(match.split("=").slice(1).join("="));
    cachedProfile = JSON.parse(raw) as WineProfileData;
  } catch {
    cachedProfile = null;
  }
  return cachedProfile;
}

// Server snapshot: always null (cookie is not available server-side here).
export function getServerProfileSnapshot(): WineProfileData | null {
  return null;
}

// No external store to subscribe to; the cookie is read synchronously.
export function subscribeProfile(_cb: () => void): () => void {
  return () => {};
}
