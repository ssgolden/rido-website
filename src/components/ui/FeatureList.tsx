import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "navy" | "sand";
type Accent = "brand" | "positive";

const textByTone: Record<Tone, string> = {
  navy: "text-white/90",
  sand: "text-ink-muted",
};

const iconByTone: Record<Tone, Record<Accent, string>> = {
  navy: { brand: "text-rido-magenta-light", positive: "text-rido-green" },
  sand: { brand: "text-rido-magenta-dark", positive: "text-rido-green" },
};

/**
 * The one feature-bullet style on the site: a bare 20px check and the item
 * text, no circles or tiles. `tone` matches the section surface; `accent`
 * is brand magenta except for compliance and sustainability, which use green.
 * Pass grid utilities in `className` for multi-column lists.
 */
export function FeatureList({
  items,
  tone = "navy",
  accent = "brand",
  className,
}: {
  items: readonly string[];
  tone?: Tone;
  accent?: Accent;
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-col gap-2.5", className)}>
      {items.map((item) => (
        <li key={item} className={cn("flex items-start gap-3 text-sm sm:text-base leading-relaxed", textByTone[tone])}>
          <Check className={cn("mt-0.5 h-5 w-5 shrink-0", iconByTone[tone][accent])} aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
