"use client";

import { useEffect, useState } from "react";
import { useScrollRootNode } from "@/components/ui/SmoothScrollProvider";

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const root = useScrollRootNode();

  useEffect(() => {
    const target: HTMLElement | Window = root ?? window;
    const handleScroll = () => {
      const scrollTop = root ? root.scrollTop : window.scrollY;
      const scrollHeight = root ? root.scrollHeight : document.documentElement.scrollHeight;
      const clientHeight = root ? root.clientHeight : window.innerHeight;
      const docHeight = scrollHeight - clientHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(scrollPercent);
    };

    handleScroll();
    target.addEventListener("scroll", handleScroll, { passive: true });
    return () => target.removeEventListener("scroll", handleScroll);
  }, [root]);

  return (
    <div
      className="scroll-progress"
      style={{ width: progress + '%' }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page scroll progress"
    />
  );
}
