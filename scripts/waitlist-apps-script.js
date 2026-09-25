/**
 * Rido Waitlist — Google Apps Script receiver.
 *
 * SETUP (one-time, ~2 minutes):
 *   1. Go to https://script.google.com/
 *   2. New project → paste this file
 *   3. Save → Deploy → New deployment → Web app
 *   4. Execute as: You
 *   5. Who has access: Anyone
 *   6. Copy the deployment URL (looks like https://script.google.com/macros/s/AKfy.../exec)
 *   7. Add it as the GitHub repository VARIABLE `NEXT_PUBLIC_WAITLIST_URL`
 *      (Settings → Secrets and variables → Actions → Variables) and/or the
 *      Vercel env var of the same name, then rebuild + deploy.
 *
 * Security notes:
 *   - Every cell is written as text and prefixed with an apostrophe when it
 *     starts with = + - @ so a crafted submission can never become a formula
 *     (formula injection could exfiltrate the sheet when opened).
 *   - locale is whitelisted, nothing else from the request is stored.
 *   - LockService serialises concurrent writes; CacheService throttles repeats.
 *
 * Local dev (no env var): the site falls back to localStorage only.
 */

const SHEET_NAME = "Rido Waitlist";
const EMAIL_RE = /^[^\s@=+\-@']{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create("Rido Waitlist");
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["timestamp", "email", "locale"]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

/** Never let a cell be interpreted as a formula. */
function cellSafe(value) {
  const s = String(value == null ? "" : value).slice(0, 254);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const email = String(body.email || "").trim().toLowerCase();
    const locale = body.locale === "es" ? "es" : "en";

    if (!EMAIL_RE.test(email) || email.length > 254) {
      return json({ ok: false, error: "invalid" });
    }

    // Throttle: one accepted write per address per minute (also absorbs double-clicks).
    const cache = CacheService.getScriptCache();
    const key = "w:" + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, email));
    if (cache.get(key)) return json({ ok: true, duplicate: true });
    cache.put(key, "1", 60);

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = getOrCreateSheet();
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        // Only the email column is compared, so a timestamp or locale can never collide.
        const emails = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
        for (let i = 0; i < emails.length; i++) {
          if (String(emails[i][0]).toLowerCase() === email) return json({ ok: true, duplicate: true });
        }
      }
      sheet.appendRow([new Date().toISOString(), cellSafe(email), locale]);
    } finally {
      lock.releaseLock();
    }
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: "server" });
  }
}

/** Public aggregate count (no emails). Cached for a minute to limit reads. */
function doGet() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get("count");
  if (cached !== null) return json({ count: Number(cached) });
  const sheet = getOrCreateSheet();
  const count = Math.max(0, sheet.getLastRow() - 1); // minus header
  cache.put("count", String(count), 60);
  return json({ count });
}
