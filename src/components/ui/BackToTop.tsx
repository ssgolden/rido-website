"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { DURATION, EASE, REVEAL } from "@/lib/motion";
import { useScrollRootNode, useScrollTo } from "@/components/ui/SmoothScrollProvider";

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const reduce = useReducedMotion();
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

  const scrollToTop = () => {
    scrollTo(0);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={reduce ? false : { opacity: 0, y: REVEAL.y }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: REVEAL.y }}
          whileHover={reduce ? undefined : { y: -2 }}
          whileTap={reduce ? undefined : { scale: 0.98 }}
          transition={{ duration: reduce ? 0 : DURATION.micro, ease: EASE }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-rido-magenta text-white flex items-center justify-center shadow-lg shadow-rido-magenta/30 hover:bg-rido-magenta-dark hover:shadow-xl hover:shadow-rido-magenta/30 transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-rido-navy"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
