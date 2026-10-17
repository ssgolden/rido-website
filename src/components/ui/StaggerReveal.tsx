import { Children, cloneElement, isValidElement, type CSSProperties, type ReactElement } from "react";
import { STAGGER } from "@/lib/motion";

interface StaggerRevealProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  /** Pause before the first child. Use so a block waits for the heading above it. */
  delay?: number;
}

type ItemProps = { children: React.ReactNode; className?: string; index?: number };

/**
 * Reveals its StaggerItem children one after another when the group scrolls
 * into view. CSS only (globals.css [data-reveal-group]); the shared
 * RevealObserver marks the group as shown. Works in server components.
 */
export function StaggerReveal({ children, className, staggerDelay = STAGGER.text, delay = 0 }: StaggerRevealProps) {
  let index = 0;
  const items = Children.map(children, (child) =>
    isValidElement(child) && child.type === StaggerItem
      ? cloneElement(child as ReactElement<ItemProps>, { index: index++ })
      : child
  );
  const style = { "--stagger": `${staggerDelay}s`, "--reveal-delay": `${delay}s` } as CSSProperties;
  return (
    <div data-reveal-group="" className={className} style={style}>
      {items}
    </div>
  );
}

export function StaggerItem({ children, className, index = 0 }: ItemProps) {
  return (
    <div data-reveal-item="" className={className} style={{ "--i": index } as CSSProperties}>
      {children}
    </div>
  );
}
