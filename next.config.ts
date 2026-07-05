import type { NextConfig } from "next";

const isExport = process.env.NEXT_OUTPUT === "export";
const isCustomDomain = process.env.CUSTOM_DOMAIN === "true";

const nextConfig: NextConfig = {
  output: isExport ? "export" : undefined,
  // For rido.bike: no basePath needed (custom domain)
  // For GitHub Pages: use /rido-website basePath
  basePath: isExport && !isCustomDomain ? "/rido-website" : "",
  allowedDevOrigins: ["100.107.180.18"],
  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: isExport,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [64, 128, 256],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: https:; connect-src 'self' https://vitals.vercel-insights.com; frame-ancestors 'none'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;