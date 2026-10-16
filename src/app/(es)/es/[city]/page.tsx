import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { announcedCities } from "@/data/cities";
import { CityLanding, getCity, getCityMetadata } from "../../../(en)/[city]/city-landing";

// Static export: only announced launch-town slugs exist; anything else 404s at build time.
export const dynamicParams = false;

export function generateStaticParams() {
  // Only announced towns get a page; with dynamicParams=false every other
  // /es/{slug} URL 404s. output:export rejects an empty param list, so if no
  // town is announced we emit one inert placeholder that resolves to notFound().
  return announcedCities.length > 0
    ? announcedCities.map((city) => ({ city: city.slug }))
    : [{ city: "launch-cities-announced-soon" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getCity(slug);
  if (!city) return {};
  return getCityMetadata(city, "es");
}

export default async function CityPageEs({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: slug } = await params;
  const city = getCity(slug);
  if (!city) notFound();
  return <CityLanding city={city} locale="es" />;
}
