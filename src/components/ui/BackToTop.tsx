"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useScrollRootNode, useScrollTo } from "@/components/ui/SmoothScrollProvider";

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const root = useScrollRootNode();
  const scrollTo = useScrollTo();

  useEffect(() => {
    const target: HTMLElement | Window = root ?? window;
    const handleScroll = () => {
      const top = root ? root.scrollTop : window.scrollY;
      const height = root ? root.clientHeight : window.innerHeight;
      setVisible(top > height * 0.5);
    };

    handleScroll();
    target.addEventListener("scroll", handleScroll, { passive: true });
    return () => target.removeEventListener("scroll", handleScroll);
  }, [root]);

  // Always rendered; .pop (globals.css) fades it in and out and takes it out of
  // the tab order and accessibility tree while hidden.
  return (
    <button
      type="button"
      onClick={() => scrollTo(0)}
      data-open={visible ? "" : undefined}
      className="pop fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 sm:bottom-6 sm:right-6 z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-rido-magenta text-white flex items-center justify-center shadow-lg shadow-rido-magenta/30 hover:bg-rido-magenta-dark hover:shadow-xl hover:shadow-rido-magenta/30 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-rido-navy"
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-5 h-5" aria-hidden="true" />
    </button>
  );
}
