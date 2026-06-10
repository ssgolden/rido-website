/**
 * City query / lookup validator.
 *
 * Used by the city-listing endpoint and the admin "edit city" forms.
 *
 * Business rules:
 *   - slug: optional; when supplied, must match a known city slug.
 *   - status: 'active' | 'coming_soon' | 'all'. Defaults to 'active' so the
 *     public site never accidentally surfaces a coming-soon city.
 */
import { z } from "zod";
import { citySlugSchema, localeSchema } from "./common";

/**
 * Public-facing filter for the city index endpoint.
 *
 * Defaults:
 *   - status: 'active' — public users only see launched cities.
 */
export const cityQuerySchema = z.object({
  slug: citySlugSchema.optional(),
  status: z
    .enum(["live", "coming_soon", "beta", "all"])
    .default("live")
    .describe("live = launched cities; coming_soon = pre-launch; beta = trial; all = both"),
  locale: localeSchema.optional(),
});
export type CityQuery = z.infer<typeof cityQuerySchema>;

/**
 * Admin-facing variant: defaults to 'all' so the dashboard shows everything
 * by default and the operator can narrow down with a status filter.
 */
export const cityAdminQuerySchema = cityQuerySchema.extend({
  status: z.enum(["live", "coming_soon", "beta", "all"]).default("all"),
});
export type CityAdminQuery = z.infer<typeof cityAdminQuerySchema>;

/**
 * A single city record, validated on the way out of the API. The server
 * module is responsible for picking the localised fields before calling
 * `.parse()`; this schema enforces shape + ranges, not translations.
 */
export const citySchema = z.object({
  slug: citySlugSchema,
  name: z.string().min(1).max(100),
  region: z.string().min(1).max(100),
  lat: z.number().gte(-90).lte(90),
  lng: z.number().gte(-180).lte(180),
  vehicles: z.array(z.enum(["e-scooter", "e-bike"])).min(1),
  comingSoon: z.boolean().default(false),
});
export type City = z.infer<typeof citySchema>;

/**
 * Discriminated union for the "filter by status" use-case: when the caller
 * supplies a slug, the slug must be valid; when they supply a status other
 * than "all", the response is *all* cities in that bucket; when "all", we
 * return the whole set. This shape mirrors the JSON contract returned by
 * `GET /api/cities`.
 */
export const cityListResponseSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("live"),
    cities: z.array(citySchema),
  }),
  z.object({
    status: z.literal("coming_soon"),
    cities: z.array(citySchema),
  }),
  z.object({
    status: z.literal("beta"),
    cities: z.array(citySchema),
  }),
  z.object({
    status: z.literal("all"),
    cities: z.array(citySchema),
  }),
]);
export type CityListResponse = z.infer<typeof cityListResponseSchema>;
