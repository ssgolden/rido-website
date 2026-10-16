import { cn } from "@/lib/utils";

export type SectionTone = "navy" | "deep" | "sand";

const toneClasses: Record<SectionTone, string> = {
  navy: "bg-rido-navy text-white",
  deep: "bg-navy-deep text-white",
  sand: "bg-sand text-ink",
};

/**
 * Page section with the standard rhythm (py-16 sm:py-24, max-w-7xl) and a
 * surface tone. Alternate tones between neighbours so no two adjacent
 * sections look alike. `data-tone` lets children style themselves for light
 * surfaces (focus-ring offsets, inputs).
 */
export function Section({
  id,
  label,
  tone = "navy",
  className,
  containerClassName,
  children,
}: {
  id: string;
  /** Accessible name for the landmark (every section needs one). */
  label: string;
  tone?: SectionTone;
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-label={label}
      data-tone={tone}
      className={cn("relative py-16 sm:py-24 px-4 sm:px-6", toneClasses[tone], className)}
    >
      <div className={cn("relative max-w-7xl mx-auto", containerClassName)}>{children}</div>
    </section>
  );
}
