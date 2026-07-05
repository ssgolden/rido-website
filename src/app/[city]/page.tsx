import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cities } from "@/data/cities";
import { CityLanding, getCity, getCityMetadata } from "./city-landing";

// Static export: only the five launch-town slugs exist; anything else 404s at build time.
export const dynamicParams = false;

export function generateStaticParams() {
  return cities.map((city) => ({ city: city.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getCity(slug);
  if (!city) return {};
  return getCityMetadata(city, "en");
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: slug } = await params;
  const city = getCity(slug);
  if (!city) notFound();
  return <CityLanding city={city} locale="en" />;
}
