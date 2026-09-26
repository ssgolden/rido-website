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
 *   7. Set NEXT_PUBLIC_WAITLIST_URL on Netlify (build-time env) to that /exec URL,
 *      then rebuild + deploy. The public site is https://www.rido.bike.
 *
 * Local dev (no env var): falls back to localStorage only.
 *
 * To view collected emails: open the linked Google Sheet (created below)
 * or check Apps Script logs.
 */

const SHEET_NAME = "Rido Waitlist";

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create("Rido Waitlist");
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["timestamp", "email", "locale", "userAgent"]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    const email = (body.email || "").toString().trim().toLowerCase();
    const locale = (body.locale || "unknown").toString();
    const ua = (body.userAgent || "").toString().slice(0, 200);

    // Basic validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "invalid" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = getOrCreateSheet();

    // Dedupe
    const existing = sheet.getDataRange().getValues().flat();
    if (existing.some((cell) => cell === email)) {
      return ContentService.createTextOutput(JSON.stringify({ ok: true, duplicate: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    sheet.appendRow([new Date().toISOString(), email, locale, ua]);

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "server" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Public count. GET the deployment URL, or GET ?count=1 — same JSON `{ count }`.
// Keep this a simple GET (no custom headers). A CORS preflight will not succeed.
function doGet(e) {
  const sheet = getOrCreateSheet();
  const lastRow = sheet.getLastRow();
  const count = Math.max(0, lastRow - 1); // minus header
  return ContentService.createTextOutput(JSON.stringify({ count }))
    .setMimeType(ContentService.MimeType.JSON);
}
