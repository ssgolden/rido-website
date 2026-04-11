import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.NEXT_OUTPUT === "export" ? "export" : undefined,
  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: process.env.NEXT_OUTPUT === "export",
  },
};

export default nextConfig;