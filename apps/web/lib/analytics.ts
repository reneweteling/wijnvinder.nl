// Product-events naar de dataLayer, zodat de bestaande GTM-container (GTM-PL683HW8)
// ze kan doorsturen naar GA4. Eén GTM-trigger luistert op event = "wv_event" en een
// GA4 Event-tag gebruikt `ga4_event` als eventnaam en de overige velden als parameters.
//
// We sturen GEEN pageviews vanaf hier: GTM/GA4 enhanced measurement doet dat al.

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

/**
 * Stuur een GA4-event via de dataLayer. `event` is de GA4-eventnaam (bv. "login",
 * "view_item", "search"). `params` worden GA4 event-parameters. No-op op de server.
 */
export function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: "wv_event", ga4_event: event, ...(params ?? {}) });
}
