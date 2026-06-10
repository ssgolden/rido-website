/**
 * Vehicle query / search validator.
 *
 * Used by the live-map API ("vehicles near me") and any list view that
 * paginates the vehicle catalogue.
 *
 * Business rules:
 *   - lat / lng: finite numbers within the standard geographic range.
 *   - radiusMeters: 100 m – 50 km. Smaller radii return noise; larger
 *     radii return the whole country and burn our geo-index.
 *   - type: 'e-scooter' | 'e-bike'.
 *   - citySlug: optional, must match a known slug if supplied.
 *   - limit: 1..200, used as a hard cap on the response payload.
 *   - Refine: if `citySlug` is supplied, reject lat/lng that obviously fall
 *     outside the city bounding box (warns against typos in the query).
 */
import { z } from "zod";
import { cities } from "@/data/cities";
import {
  citySlugSchema,
  localeSchema,
} from "./common";

export const vehicleTypeSchema = z.enum(["e-scooter", "e-bike"]);
export type VehicleType = z.infer<typeof vehicleTypeSchema>;

/**
 * Schema for "vehicles near a point" queries.
 *
 * Numbers are accepted as strings *or* numbers via `z.coerce.number()` so the
 * same schema works for both `?lat=36.5` query params (strings) and a JSON
 * POST body (numbers).
 */
export const vehicleQuerySchema = z
  .object({
    lat: z.coerce
      .number()
      .gte(-90, "lat must be ≥ -90")
      .lte(90, "lat must be ≤ 90")
      .refine((n) => Number.isFinite(n), "lat must be a finite number"),

    lng: z.coerce
      .number()
      .gte(-180, "lng must be ≥ -180")
      .lte(180, "lng must be ≤ 180")
      .refine((n) => Number.isFinite(n), "lng must be a finite number"),

    radiusMeters: z.coerce
      .number()
      .int("radiusMeters must be an integer")
      .min(100, "radiusMeters must be at least 100")
      .max(50000, "radiusMeters must be at most 50000"),

    type: vehicleTypeSchema,

    citySlug: citySlugSchema.optional(),

    limit: z.coerce
      .number()
      .int("limit must be an integer")
      .min(1, "limit must be at least 1")
      .max(200, "limit must be at most 200")
      .default(50),
  })
  .refine(
    (q) => {
      // Soft check: if the caller pins a city, sanity-check that lat/lng
      // land within ~0.5° of that city's centre. This catches typos like
      // swapped lat/lng or a dropped minus sign before we hit the DB.
      if (!q.citySlug) return true;
      const city = cities.find((c) => c.slug === q.citySlug);
      if (!city) return true; // citySlug is also enum-validated; this is belt-and-braces
      const within = 0.5;
      return (
        Math.abs(q.lat - city.lat) <= within &&
        Math.abs(q.lng - city.lng) <= within
      );
    },
    {
      message: "lat/lng are far from the city centre; check for a typo",
      path: ["citySlug"],
    },
  );
export type VehicleQuery = z.infer<typeof vehicleQuerySchema>;

/**
 * Vehicle type, branded. Useful when you want to hand a `VehicleType` around
 * without it being silently assignable to/from a plain string.
 */
export const brandedVehicleTypeSchema = vehicleTypeSchema.brand<"VehicleType">();
export type BrandedVehicleType = z.infer<typeof brandedVehicleTypeSchema>;

/**
 * GET-query variant for the public catalogue endpoint — adds locale so the
 * server can pick the right display labels.
 */
export const vehicleCatalogQuerySchema = z.object({
  type: vehicleTypeSchema.optional(),
  citySlug: citySlugSchema.optional(),
  limit: z
    .coerce
    .number()
    .int()
    .min(1)
    .max(200)
    .default(50),
  locale: localeSchema.optional(),
});
export type VehicleCatalogQuery = z.infer<typeof vehicleCatalogQuerySchema>;
