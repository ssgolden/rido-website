import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Framed image slot on a sunlit sand surface.
 *
 * Placeholder strategy (Phase C): transparent product cut-outs
 * (public/images/cutouts, keyed from the studio renders) with `fit="contain"`.
 * When the Torrevieja photography arrives, pass the photo with `fit="cover"`
 * — the frame, radius and aspect stay the same.
 */
export function ImageFrame({
  src,
  alt,
  sizes,
  priority = false,
  fit = "contain",
  aspect = "aspect-[4/3]",
  className,
  imageClassName,
  imageWrapperClassName,
  children,
}: {
  src: string;
  alt: string;
  sizes: string;
  /** Above-the-fold LCP image: load eagerly at high fetch priority. */
  priority?: boolean;
  fit?: "contain" | "cover";
  aspect?: string;
  className?: string;
  imageClassName?: string;
  /** Classes for the layer holding the image (e.g. a CSS scroll-driven ride). */
  imageWrapperClassName?: string;
  /** Overlays (chips, captions) positioned inside the frame. */
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("image-frame-sun relative overflow-hidden rounded-3xl ring-1 ring-black/5", aspect, className)}>
      <div className={cn("absolute inset-0", imageWrapperClassName)}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          // Next 16 deprecates `priority`; the LCP image is in the HTML, so eager + high priority is enough.
          loading={priority ? "eager" : undefined}
          fetchPriority={priority ? "high" : undefined}
          className={cn(fit === "contain" ? "object-contain p-6 sm:p-10" : "object-cover", imageClassName)}
        />
      </div>
      {children}
    </div>
  );
}
