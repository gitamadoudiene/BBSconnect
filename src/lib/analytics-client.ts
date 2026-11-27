/**
 * First-party, cookie-less analytics. Two random ids live in the browser:
 * a visitor id (localStorage) and a session id that rotates after 30 min
 * of inactivity. No IP address or personal data ever leaves the page.
 */

const VISITOR_KEY = "bbs_vid";
const SESSION_KEY = "bbs_sid";
const SESSION_TTL = 30 * 60 * 1000;

let disabled = false;

export function disableTracking() {
  disabled = true;
}

function randomId() {
  return crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export function analyticsIds() {
  try {
    let visitorId = localStorage.getItem(VISITOR_KEY);
    if (!visitorId) {
      visitorId = randomId();
      localStorage.setItem(VISITOR_KEY, visitorId);
    }
    const raw = localStorage.getItem(SESSION_KEY);
    const [sid, last] = raw ? raw.split("|") : [];
    const sessionId = sid && Date.now() - Number(last) < SESSION_TTL ? sid : randomId();
    localStorage.setItem(SESSION_KEY, `${sessionId}|${Date.now()}`);
    return { visitorId, sessionId };
  } catch {
    return null;
  }
}

export type TrackType = "PAGE_VIEW" | "ADD_TO_CART";

export function track(type: TrackType, data: { path?: string; productSlug?: string; value?: number } = {}) {
  if (disabled || typeof window === "undefined") return;
  if (navigator.doNotTrack === "1" || (navigator as Navigator & { webdriver?: boolean }).webdriver) return;
  const ids = analyticsIds();
  if (!ids) return;
  const payload = JSON.stringify({
    type,
    path: data.path ?? location.pathname,
    productSlug: data.productSlug,
    value: data.value,
    referrer: type === "PAGE_VIEW" ? document.referrer || undefined : undefined,
    ...ids,
  });
  const blob = new Blob([payload], { type: "application/json" });
  if (!navigator.sendBeacon?.("/api/track", blob)) {
    void fetch("/api/track", { method: "POST", body: payload, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
  }
}
