/**
 * Shared motion system for the marketing site.
 *
 * One entrance curve, two timed durations, one stagger scale:
 * - micro interactions: 200ms (hover, press, accordion, menus)
 * - entrances: 500ms (scroll and load reveals)
 * Ambient loops stay between 2s and 6s and live in globals.css.
 *
 * CSS twins of the micro curve: .btn-lift, .card-lift, .nav-link, .field.
 * Every Framer entrance checks useReducedMotion() and renders a static
 * equivalent. The stylesheet kill-switch covers CSS animations.
 */
export const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

export const DURATION = {
  micro: 0.2,
  entrance: 0.5,
} as const;

/** Short travel. Offsets much past this read as a template slide-in. */
export const REVEAL = {
  y: 16,
  x: 16,
} as const;

export const STAGGER = {
  text: 0.09,
  grid: 0.12,
} as const;

export const SCROLL_MARGIN = "-10% 0px";
