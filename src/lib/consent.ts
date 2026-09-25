/**
 * Cookie-consent record shared by the banner and the analytics loader.
 *
 * Bump CONSENT_VERSION whenever the cookie policy changes what is collected;
 * an older stored record is treated as "not yet answered" so the banner
 * re-prompts.
 */
export const CONSENT_STORAGE_KEY = "rido-cookie-consent";
export const CONSENT_EVENT = "rido-consent-change";
export const CONSENT_VERSION = 2;

export interface ConsentRecord {
  accepted: boolean;
  timestamp: number;
  version: number;
}

export function readConsentRecord(): ConsentRecord | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
    if (typeof parsed.accepted !== "boolean") return null;
    if (parsed.version !== CONSENT_VERSION) return null;
    return { accepted: parsed.accepted, timestamp: parsed.timestamp ?? 0, version: CONSENT_VERSION };
  } catch {
    return null;
  }
}

export function writeConsentRecord(accepted: boolean): void {
  try {
    if (typeof window === "undefined") return;
    const record: ConsentRecord = { accepted, timestamp: Date.now(), version: CONSENT_VERSION };
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    /* storage blocked — the banner will simply show again next visit */
  }
  try {
    window.dispatchEvent(new Event(CONSENT_EVENT));
  } catch {
    /* ignore */
  }
}
