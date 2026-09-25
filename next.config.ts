import type { NextConfig } from "next";

const isExport = process.env.NEXT_OUTPUT === "export";
const isCustomDomain = process.env.CUSTOM_DOMAIN === "true";

/**
 * Security headers for server hosts (Vercel). `headers()` is ignored by the
 * static export (GitHub Pages cannot send custom headers at all), so this is
 * only registered for server builds to avoid the build-time warning.
 *
 * CSP: React/Next hydration and JSON-LD require inline scripts, and static
 * hosting rules out per-request nonces, so script-src keeps 'unsafe-inline'.
 * connect-src lists the only external origins the site talks to.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://tiles.openfreemap.org",
      "font-src 'self'",
      "connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com https://tiles.openfreemap.org https://script.google.com https://script.googleusercontent.com",
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: isExport ? "export" : undefined,
  ...(isExport
    ? {}
    : {
        async headers() {
          return [{ source: "/(.*)", headers: securityHeaders }];
        },
      }),
  // For rido.bike: no basePath needed (custom domain)
  // For GitHub Pages: use /rido-website basePath
  basePath: isExport && !isCustomDomain ? "/rido-website" : "",
  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: isExport,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [64, 128, 256],
  },
  // Tree-shake barrel imports for heavy packages so they never leak into
  // the homepage vendor chunk. Especially important for framer-motion and
  // lucide-react which are imported in many places.
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@react-three/fiber",
      "@react-three/drei",
      "three",
      "gsap",
      "@react-spring/web",
      "@use-gesture/react",
      "cmdk",
      "vaul",
      "sonner",
      "simplex-noise",
    ],
  },
};

export default nextConfig;