/**
 * Barrel for the observability module.
 *
 * Re-exports the logger, metrics registry, and error-capture helper so
 * consumers can write:
 *
 * ```ts
 * import { getLogger, getMetrics, captureError } from "@/lib/observability";
 * ```
 *
 * @module observability
 */
export { getLogger, _resetLoggerForTests } from "./logger";
export type { Logger, LogArgs, LogBindings, LogLevel } from "./logger";

export { getMetrics } from "./metrics";
export type { Labels, Metrics, SeriesKey, SeriesState } from "./metrics";

export { captureError } from "./errors";
export type { ErrorContext } from "./errors";
