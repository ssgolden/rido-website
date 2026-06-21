import type { Metadata } from "next";
import { AnimationShowcase } from "@/components/animation/AnimationShowcase";

export const metadata: Metadata = {
  title: "Motion Lab — Rido",
  description:
    "Enterprise animation primitives for rido.bike: GSAP ScrollTrigger, react-three-fiber WebGL, react-spring physics, vaul drawers, sonner toasts, and more.",
  robots: { index: false, follow: false },
};

export default function MotionLabPage() {
  return <AnimationShowcase />;
}
