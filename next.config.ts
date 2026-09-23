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