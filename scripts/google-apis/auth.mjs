/**
 * Authenticate with Google APIs using OAuth 2.0 installed-app flow.
 * Generates a refresh_token that can be used server-side to read
 * Search Console and Google Analytics 4 data.
 *
 * Usage:
 *   1. npm install googleapis
 *   2. Create OAuth client in Google Cloud → download JSON
 *   3. Copy scripts/google-apis/.env.example → .env and fill values
 *   4. node scripts/google-apis/auth.mjs
 */
import { google } from "googleapis";
import { createServer } from "http";
import { readFileSync } from "fs";
import { URL } from "url";

const redirectUri = "http://localhost:3001/oauth/callback";

function loadEnv(path) {
  const text = readFileSync(path, "utf8");
  return Object.fromEntries(
    text
      .split("\n")
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const [k, ...v] = line.split("=");
        return [k.trim(), v.join("=").trim()];
      })
  );
}

const env = loadEnv(new URL(".env", import.meta.url).pathname);

const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  redirectUri
);

const scopes = [
  "https://www.googleapis.com/auth/webmasters.readonly",
  "https://www.googleapis.com/auth/analytics.readonly",
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
  prompt: "consent",
  include_granted_scopes: true,
});

console.log("Open this URL in your browser:\n", authUrl);

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname !== "/oauth/callback") {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const code = url.searchParams.get("code");
  if (!code) {
    res.writeHead(400);
    res.end("Missing code");
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log("\n=== TOKENS ===");
    console.log("Access token:", tokens.access_token?.slice(0, 20) + "...");
    console.log("Refresh token:", tokens.refresh_token || "NO REFRESH TOKEN — revoke access at myaccount.google.com and rerun with prompt=consent");
    console.log("Scope:", tokens.scope);
    console.log("Expires:", tokens.expiry_date);
    console.log("\nStore refresh_token in .env as GOOGLE_REFRESH_TOKEN\n");

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`<h1>Authorized.</h1><p>You can close this window. Refresh token printed in terminal.</p>`);
  } catch (err) {
    console.error("Token exchange failed:", err);
    res.writeHead(500);
    res.end("Token exchange failed. Check terminal.");
  } finally {
    server.close();
    process.exit(0);
  }
});

server.listen(3001, () => console.log("Callback server listening on http://localhost:3001"));
