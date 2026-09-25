import type { Metadata } from "next";
import NotFound from "@/app/not-found";
import { cities, citiesAnnounced } from "@/data/cities";
import { CityLanding, getCity, getCityMetadata } from "../../[city]/city-landing";

// Static export: only the five launch-town slugs exist; anything else 404s at build time.
export const dynamicParams = false;

export function generateStaticParams() {
  // Until the launch towns are announced (citiesAnnounced), no city pages are
  // built at all — with dynamicParams=false every /es/{slug} URL 404s.
  // output:export rejects an empty param list, so while unannounced we emit
  // one inert placeholder slug that resolves to notFound() (no town names).
  return citiesAnnounced
    ? cities.map((city) => ({ city: city.slug }))
    : [{ city: "launch-cities-announced-soon" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getCity(slug);
  if (!city) return { title: "Page Not Found — Rido", robots: { index: false, follow: false } };
  return getCityMetadata(city, "es");
}

export default async function CityPageEs({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: slug } = await params;
  const city = getCity(slug);
  // Pre-announcement placeholder slug: render the branded 404 (a full page,
  // not the bare error shell notFound() produces during static export).
  if (!city) return <NotFound />;
  return <CityLanding city={city} locale="es" />;
}
