import { type ClassValue, clsx } from "clsx";

/**
 * Joins class names. Plain clsx: tailwind-merge (8 KB gz on every page) was
 * only ever resolving two default-width overrides, which Section and
 * WaitlistForm now handle themselves. Conflicting utilities are NOT merged, so
 * override with `!` or avoid passing a class that clashes with a default.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
