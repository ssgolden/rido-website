import type { NextConfig } from "next";

const isExport = process.env.NEXT_OUTPUT === "export";
const isCustomDomain = process.env.CUSTOM_DOMAIN === "true";
// Netlify sets NETLIFY=true in its build environment. Only there can images
// go through Netlify Image CDN (src/lib/netlify-image-loader.ts).
const onNetlify = process.env.NETLIFY === "true";

const nextConfig: NextConfig = {
  output: isExport ? "export" : undefined,
  // For rido.bike: no basePath needed (custom domain)
  // For GitHub Pages: use /rido-website basePath
  basePath: isExport && !isCustomDomain ? "/rido-website" : "",
  images: {
    formats: ["image/avif", "image/webp"],
    ...(isExport && onNetlify
      ? { loader: "custom" as const, loaderFile: "./src/lib/netlify-image-loader.ts" }
      : { unoptimized: isExport }),
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [64, 128, 256],
  },
  // Tree-shake framer-motion's barrel imports (lucide-react is optimised by
  // Next by default).
  experimental: {
    optimizePackageImports: ["framer-motion"],
    // app/global-not-found.tsx serves unmatched URLs as one valid document
    // (the site has two root layouts, so a plain not-found.tsx nested <html>).
    globalNotFound: true,
  },
};

export default nextConfig;