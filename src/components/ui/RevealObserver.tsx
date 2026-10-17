"use client";

import { useEffect } from "react";
import { SCROLL_MARGIN } from "@/lib/motion";

const SELECTOR = "[data-reveal]:not([data-shown]), [data-reveal-group]:not([data-shown])";

declare global {
  interface Window {
    __ridoRevealReady?: boolean;
  }
}

/**
 * The one IntersectionObserver behind every ScrollReveal / StaggerReveal on
 * the page (instead of one observer per block). Marks blocks with
 * `data-shown` as they enter the scroll lane; CSS does the animation. Watches
 * the DOM for blocks that mount later (client islands, route changes).
 */
export function RevealObserver() {
  useEffect(() => {
    window.__ridoRevealReady = true;
    const root = document.getElementById("page-scroll");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-shown", "");
          io.unobserve(entry.target);
        }
      },
      // Reveal once a block is 10% inside the lane.
      { root, rootMargin: SCROLL_MARGIN }
    );
    const observeAll = (scope: ParentNode) => scope.querySelectorAll(SELECTOR).forEach((el) => io.observe(el));
    observeAll(document);
    const mo = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches(SELECTOR)) io.observe(node);
          observeAll(node);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}
