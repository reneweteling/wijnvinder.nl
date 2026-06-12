"use client";

import { useState, useEffect, useCallback } from "react";
import { useSyncExternalStore } from "react";
import Link from "next/link";

const COOKIE_NAME = "cookie-consent";

type Consent = "granted" | "denied";

function getConsent(): Consent | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((r) => r.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  const value = match.split("=")[1];
  return value === "granted" || value === "denied" ? value : null;
}

function setConsentCookie(value: Consent) {
  const maxAge = 365 * 24 * 60 * 60;
  document.cookie = `${COOKIE_NAME}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
}

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

// Loads Google Tag Manager once, after the visitor has granted consent.
// Module-level guard so it never injects twice across re-renders or remounts.
let gtmInjected = false;
function loadGtm(gtmId: string) {
  if (gtmInjected || !gtmId || typeof document === "undefined") return;
  gtmInjected = true;

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  }
  // Consent Mode v2: declare the default before the tag, then grant it.
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
  gtag("consent", "update", {
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
    analytics_storage: "granted",
  });

  window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
  document.head.appendChild(script);
}

// useSyncExternalStore: server snapshot returns null (no cookie on server),
// client snapshot reads the actual cookie — safe for hydration.
function subscribe(cb: () => void) {
  // Cookies don't fire events; we only need the initial client read.
  void cb;
  return () => {};
}

// Inlined at build time by Next.js. Must be present when `next build` runs.
const GTM_ID = process.env.NEXT_PUBLIC_GOOGLE_GTM_ID ?? "";

export function CookieConsent() {
  // consent: what the cookie says on the client (null = not yet set).
  // useSyncExternalStore gives the server a stable null snapshot so hydration matches.
  const consent = useSyncExternalStore(subscribe, getConsent, () => null);
  // dismissed: true once the user clicks accept/decline in this session
  const [dismissed, setDismissed] = useState(false);

  // Returning visitors who previously accepted get GTM loaded straight away.
  useEffect(() => {
    if (consent === "granted") loadGtm(GTM_ID);
  }, [consent]);

  const handleAccept = useCallback(() => {
    setConsentCookie("granted");
    loadGtm(GTM_ID);
    setDismissed(true);
  }, []);

  const handleDecline = useCallback(() => {
    setConsentCookie("denied");
    setDismissed(true);
  }, []);

  // Show banner when no consent cookie exists and user hasn't dismissed yet
  if (consent !== null || dismissed) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:inset-x-auto sm:right-4 sm:bottom-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mx-auto w-full max-w-md sm:max-w-sm bg-card border border-border rounded-xl shadow-xl p-5">
        <h2 className="font-heading text-base font-semibold text-foreground mb-1.5">
          Cookies
        </h2>
        <p className="text-sm text-text-light leading-relaxed">
          We gebruiken een paar cookies om de site te laten werken en te
          begrijpen hoe hij gebruikt wordt.{" "}
          <Link
            href="/privacybeleid"
            className="text-burgundy font-medium underline underline-offset-2 hover:text-burgundy-dark"
          >
            Bekijk wat we gebruiken
          </Link>
        </p>
        <div className="mt-4 flex gap-2.5">
          <button
            onClick={handleAccept}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-burgundy rounded-lg hover:bg-burgundy-dark transition-colors"
          >
            Alles accepteren
          </button>
          <button
            onClick={handleDecline}
            className="flex-1 px-4 py-2 text-sm font-medium text-text-light border border-border rounded-lg hover:bg-cream transition-colors"
          >
            Alleen noodzakelijk
          </button>
        </div>
      </div>
    </div>
  );
}
