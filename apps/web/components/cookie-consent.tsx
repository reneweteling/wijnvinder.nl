"use client";

import { useState, useEffect, useCallback } from "react";

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

function updateGtagConsent(value: Consent) {
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  }
  gtag("consent", "update", {
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
    analytics_storage: value,
  });
}

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getConsent();
    if (consent) {
      updateGtagConsent(consent);
    } else {
      setVisible(true);
    }
  }, []);

  const handleAccept = useCallback(() => {
    setConsentCookie("granted");
    updateGtagConsent("granted");
    setVisible(false);
  }, []);

  const handleDecline = useCallback(() => {
    setConsentCookie("denied");
    updateGtagConsent("denied");
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl shadow-lg p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-text leading-relaxed">
              We gebruiken cookies om je ervaring te verbeteren en ons verkeer te analyseren.{" "}
              <a href="/privacy" className="text-burgundy underline underline-offset-2 hover:text-burgundy-dark">
                Privacybeleid
              </a>
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm font-medium text-text-light border border-border rounded-lg hover:bg-cream transition-colors"
            >
              Weigeren
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm font-medium text-white bg-burgundy rounded-lg hover:bg-burgundy-dark transition-colors"
            >
              Accepteren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
