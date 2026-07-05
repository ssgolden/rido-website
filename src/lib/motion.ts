/**
 * Rido brand motion identity — THE single source of truth.
 *
 * These are the only sanctioned easing/duration values for Framer Motion
 * transitions on the site. Do not introduce ad-hoc cubic-beziers or
 * durations; extend this module instead.
 *
 * Defined by the motion identity section of
 * `.claude/skills/premium-web/SKILL.md`:
 * - One easing family (EASE_BRAND) for entrances; `easeOut` <= 300ms for
 *   micro-interactions.
 * - Three durations only: 200ms micro, 500ms entrance, 2-6s ambient.
 */

/**
 * Brand entrance easing (cubic-bezier). Typed as a readonly tuple so it is
 * directly assignable to framer-motion's `Easing` (`BezierDefinition` is
 * `readonly [number, number, number, number]`).
 */
export const EASE_BRAND = [0.25, 0.46, 0.45, 0.94] as const;

/** Brand durations in seconds (framer-motion units). */
export const DUR = {
  /** Micro-interactions (hover, tap feedback). */
  micro: 0.2,
  /** Section/element entrances (ScrollReveal, StaggerReveal). */
  entrance: 0.5,
  /** Ambient loops (2-6s band; 3s default). */
  ambient: 3,
} as const;
