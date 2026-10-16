import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { SectionTone } from "@/components/ui/Section";

/**
 * Section heading block. Sentence-case label, plain heading (no gradient
 * text — that is reserved for the hero), optional intro. Colours follow the
 * surface tone so it reads on navy and on sand.
 */
export function SectionHeader({
  label,
  title,
  intro,
  align = "center",
  tone = "navy",
  as: Heading = "h2",
  className,
}: {
  label?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  align?: "center" | "left";
  tone?: SectionTone;
  /** Use "h1" when the section is the page's main heading. */
  as?: "h1" | "h2";
  className?: string;
}) {
  const light = tone === "sand";
  // A page's h1 block is above the fold and often the LCP element: render it
  // visible from the first paint instead of revealing it after hydration.
  const Wrapper = Heading === "h1" ? "div" : ScrollReveal;
  return (
    <Wrapper
      className={cn(
        "mb-10 sm:mb-14",
        align === "center" ? "text-center mx-auto max-w-2xl" : "max-w-xl",
        className
      )}
    >
      {label ? (
        <p className={cn("text-sm font-semibold mb-3", light ? "text-rido-magenta-dark" : "text-rido-magenta-light")}>
          {label}
        </p>
      ) : null}
      <Heading className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-balance">{title}</Heading>
      {intro ? (
        <p className={cn("mt-4 text-base sm:text-lg leading-relaxed", light ? "text-ink-muted" : "text-muted")}>
          {intro}
        </p>
      ) : null}
    </Wrapper>
  );
}
