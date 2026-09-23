"use client";

import { useState, useSyncExternalStore } from "react";
import { RidoLogo } from "@/components/ui/RidoLogo";
import { Download, Trash2, Copy, Check } from "lucide-react";

const WAITLIST_KEY = "rido-waitlist-email";

function readEmails(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WAITLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Waitlist Admin — dev/preview-only page. Not linked from anywhere in the
 * public site navigation. Shows every email captured in this browser's
 * localStorage with one-click export to JSON/CSV.
 *
 * Limitation (by design of static hosting): this ONLY sees signups that were
 * made in THIS browser. Other visitors' emails stay on their devices until
 * NEXT_PUBLIC_WAITLIST_URL is set and submissions can reach a real backend.
 */
export default function WaitlistAdminPage() {
  const emails = useSyncExternalStore(
    (cb) => {
      window.addEventListener("storage", cb);
      return () => window.removeEventListener("storage", cb);
    },
    () => JSON.stringify(readEmails()),
    () => "[]" // SSR snapshot
  );
  const parsedEmails: string[] = JSON.parse(emails);

  const [copied, setCopied] = useState(false);

  const downloadJson = () => {
    if (parsedEmails.length === 0) return;
    const blob = new Blob([JSON.stringify({ emails: parsedEmails, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rido-waitlist-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCsv = () => {
    if (parsedEmails.length === 0) return;
    const csv = ["email", ...parsedEmails].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rido-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyAll = async () => {
    if (parsedEmails.length === 0) return;
    await navigator.clipboard.writeText(parsedEmails.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    if (!confirm("Delete every email captured in this browser? This cannot be undone.")) return;
    localStorage.removeItem(WAITLIST_KEY);
    // Trigger the storage-event listener so the page re-renders.
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <main className="min-h-dvh px-4 sm:px-6 py-12 bg-rido-navy text-white">
      <div className="max-w-2xl mx-auto">
        <RidoLogo variant="full" size="md" />
        <h1 className="mt-8 text-3xl font-black">Waitlist Admin</h1>
        <p className="mt-2 text-muted text-sm">
          This page is <strong>not linked from anywhere</strong>. It only shows emails
          stored in <em>this</em> browser&apos;s localStorage. Visitors&apos; emails stay on
          their own devices until you wire <code className="text-rido-magenta-light">NEXT_PUBLIC_WAITLIST_URL</code> to the
          Apps Script backend (see <code className="text-rido-magenta-light">docs/WAITLIST-SETUP.md</code>).
        </p>

        <div className="mt-8 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-3xl font-black text-rido-magenta-light tabular-nums">
                {parsedEmails.length}
              </p>
              <p className="text-xs uppercase tracking-wider text-muted mt-1">
                {parsedEmails.length === 1 ? "email" : "emails"} captured
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={downloadJson}
                disabled={parsedEmails.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] text-xs font-semibold rounded-lg bg-rido-magenta/15 text-rido-magenta-light border border-rido-magenta/30 hover:bg-rido-magenta/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> JSON
              </button>
              <button
                onClick={downloadCsv}
                disabled={parsedEmails.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] text-xs font-semibold rounded-lg glass hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
              <button
                onClick={copyAll}
                disabled={parsedEmails.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] text-xs font-semibold rounded-lg glass hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-rido-green" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={clearAll}
                disabled={parsedEmails.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] text-xs font-semibold rounded-lg bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          </div>

          {parsedEmails.length === 0 ? (
            <p className="text-sm text-muted">No emails captured yet in this browser. Submit the form on the homepage to see entries here.</p>
          ) : (
            <ul className="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
              {parsedEmails.map((email) => (
                <li
                  key={email}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/5 text-sm"
                >
                  <span className="font-mono text-white/90 truncate">{email}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="mt-6 text-xs text-muted-weak">
          GDPR note: emails captured in localStorage are stored on the visitor&apos;s device,
          not on your servers, so they aren&apos;t subject to a typical processing record —
          but once you wire the Apps Script backend, those emails DO land in Google Sheets
          under your account and require the usual consent + retention policy.
        </p>
      </div>
    </main>
  );
}
