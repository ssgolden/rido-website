/**
 * Shared motion system for the marketing site.
 *
 * One entrance curve (cubic-bezier(0.22, 1, 0.36, 1)), two timed durations,
 * one stagger scale:
 * - micro interactions: 200ms (hover, press, accordion, menus)
 * - entrances: 500ms (scroll and load reveals)
 * Ambient loops stay between 2s and 6s and live in globals.css.
 *
 * CSS twins of the micro curve: .btn-lift, .card-lift, .nav-link, .field.
 * All motion is CSS (globals.css): every animation sits under
 * prefers-reduced-motion: no-preference, and the stylesheet kill-switch
 * covers the rest. These values are the JS twins of those timings.
 */
export const DURATION = {
  micro: 0.2,
  entrance: 0.5,
} as const;

export const STAGGER = {
  text: 0.09,
  grid: 0.12,
} as const;

export const SCROLL_MARGIN = "-10% 0px";
