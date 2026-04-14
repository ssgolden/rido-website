import type { NextConfig } from "next";

const isExport = process.env.NEXT_OUTPUT === "export";
const isCustomDomain = process.env.CUSTOM_DOMAIN === "true";

const nextConfig: NextConfig = {
  output: isExport ? "export" : undefined,
  // For rido.bike: no basePath needed (custom domain)
  // For GitHub Pages: use /rido-website basePath
  basePath: isExport && !isCustomDomain ? "/rido-website" : "",
  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: isExport,
  },
};

export default nextConfig;