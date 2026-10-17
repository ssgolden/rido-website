#!/usr/bin/env node
/**
 * Serves the static export (out/) the way Netlify serves www.rido.bike, so the
 * QA gates test what production actually ships:
 * - pretty URLs: /privacy -> privacy.html, /es -> es.html, / -> index.html
 * - unknown paths get out/404.html with status 404
 * - every header from public/_headers, matched by Netlify's path rules
 *   (exact paths and trailing /* splats), including the Content-Security-Policy
 *
 * Usage: node scripts/serve-export.mjs [port] [dir]   (defaults: 3000, out)
 * Node built-ins only. Not for production use.
 */
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";

const port = Number(process.argv[2] ?? 3000);
const dir = resolve(process.argv[3] ?? "out");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".xml": "application/xml",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

/** public/_headers -> [{ pattern, headers: [[name, value]] }] */
function parseHeaders(file) {
  if (!existsSync(file)) return [];
  const rules = [];
  for (const raw of readFileSync(file, "utf8").split("\n")) {
    const line = raw.replace(/\s+$/, "");
    if (!line || line.trimStart().startsWith("#")) continue;
    if (!/^\s/.test(line)) {
      rules.push({ pattern: line.trim(), headers: [] });
    } else if (rules.length) {
      const i = line.indexOf(":");
      if (i > 0) rules.at(-1).headers.push([line.slice(0, i).trim(), line.slice(i + 1).trim()]);
    }
  }
  return rules;
}

function matches(pattern, path) {
  if (pattern.endsWith("/*")) return path.startsWith(pattern.slice(0, -1)) || path === pattern.slice(0, -2);
  return path === pattern;
}

const rules = parseHeaders(join(dir, "_headers"));

function headersFor(path) {
  const out = {};
  for (const rule of rules) if (matches(rule.pattern, path)) for (const [k, v] of rule.headers) out[k] = v;
  return out;
}

function resolveFile(path) {
  const safe = normalize(path).replace(/^(\.\.[/\\])+/, "");
  const base = join(dir, safe);
  if (!base.startsWith(dir)) return null;
  const candidates = safe.endsWith("/") ? [join(base, "index.html"), base.replace(/\/$/, "") + ".html"] : [base, base + ".html", join(base, "index.html")];
  return candidates.find((f) => existsSync(f) && statSync(f).isFile()) ?? null;
}

createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
  const file = resolveFile(path);
  const status = file ? 200 : 404;
  const body = file ?? join(dir, "404.html");
  res.writeHead(status, {
    "content-type": TYPES[extname(body)] ?? "application/octet-stream",
    ...headersFor(path),
  });
  res.end(existsSync(body) ? readFileSync(body) : "Not found");
}).listen(port, () => console.log(`[serve-export] ${dir} on http://localhost:${port} (${rules.length} header rules)`));
