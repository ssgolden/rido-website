import type { NextConfig } from "next";

const isExport = process.env.NEXT_OUTPUT === "export";

const nextConfig: NextConfig = {
  output: isExport ? "export" : undefined,
  basePath: isExport ? "/rido-website" : "",
  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: isExport,
  },
};

export default nextConfig;