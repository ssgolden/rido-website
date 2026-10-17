/**
 * next/image loader for Netlify Image CDN (www.rido.bike).
 *
 * Used only for Netlify builds (next.config.ts checks NETLIFY=true, which
 * Netlify sets during its builds). /.netlify/images resizes on the fly and
 * serves AVIF or WebP to browsers that accept them, so `srcset`/`sizes`
 * finally work in the static export: thumbnails fetch ~160 px images
 * instead of full renders.
 * Other hosts (GitHub Pages mirror, local) keep `images.unoptimized`.
 */
export default function netlifyImageLoader({ src, width, quality }: { src: string; width: number; quality?: number }): string {
  if (src.endsWith(".svg")) return src;
  return `/.netlify/images?url=${encodeURIComponent(src)}&w=${width}&q=${quality ?? 75}`;
}
