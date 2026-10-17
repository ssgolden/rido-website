/**
 * Cookie-consent store shared by the banner, the analytics loader, the
 * conversion events and the footer "Cookie settings" link.
 *
 * The choice lives in localStorage under `rido-cookie-consent` (named in the
 * Cookie Policy). Changes are broadcast with a same-tab custom event as well
 * as the cross-tab `storage` event, so accepting starts analytics at once and
 * withdrawing stops it, without a reload.
 */
export const CONSENT_KEY = "rido-cookie-consent";
const CHANGE_EVENT = "rido-consent-change";

export type ConsentState = "accepted" | "declined" | "unset";

export function readConsent(): ConsentState {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return "unset";
    return JSON.parse(raw).accepted === true ? "accepted" : "declined";
  } catch {
    return "unset";
  }
}

function notify() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function saveConsent(accepted: boolean): void {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted, timestamp: Date.now() }));
  } catch {
    // Storage blocked: the choice applies to this page view only.
  }
  notify();
}

/** Withdraws the stored choice; the banner shows again so the visitor can choose afresh. */
export function resetConsent(): void {
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch {
    // ignore
  }
  notify();
}

/** useSyncExternalStore-compatible subscription. */
export function subscribeConsent(callback: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === CONSENT_KEY) callback();
  };
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}
