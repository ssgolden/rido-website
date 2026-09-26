"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

  const scrollToTop = () => {
    scrollTo(0);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-rido-magenta text-white flex items-center justify-center shadow-lg shadow-rido-magenta/30 hover:bg-rido-magenta-dark transition-all duration-300 cursor-pointer hover:scale-110"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
