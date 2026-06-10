/**
 * In-process metrics registry for Rido.
 *
 * Provides counter / histogram / gauge primitives backed by a single
 * `Map`. No Prometheus client dependency — the registry stores the
 * minimum state needed to derive averages, sums, and last-value, which
 * is enough for health endpoints and ad-hoc dashboards.
 *
 * The registry is process-local. In serverless or multi-worker
 * deployments each instance keeps its own counters, so absolute values
 * are not comparable across instances. If the project later needs
 * cross-instance aggregation, swap the storage layer for a Redis-backed
 * implementation behind the same `Metrics` interface.
 *
 * @module observability/metrics
 */

/** A label set is a flat string→string map. Booleans/numbers are coerced. */
export type Labels = Record<string, string | number | boolean>;

/** A series key is the metric name plus its sorted, serialized label tuple. */
export type SeriesKey = string;

/**
 * Internal aggregate for a single labeled series. The `kind` drives which
 * fields are actually updated when a sample arrives.
 */
export interface SeriesState {
  /** "counter" | "histogram" | "gauge" — used by `snapshot()` for clarity. */
  kind: "counter" | "histogram" | "gauge";
  /** Monotonic running total (counter, histogram). */
  sum: number;
  /** Number of samples observed (histogram only). */
  count: number;
  /** Most recent observed value (gauge, histogram). */
  last: number;
  /** Minimum observed value (histogram only). */
  min: number;
  /** Maximum observed value (histogram, gauge). */
  max: number;
  /** Label set retained for snapshot output. */
  labels: Labels;
  /** First-seen timestamp (ms since epoch). */
  createdAt: number;
  /** Last-updated timestamp (ms since epoch). */
  updatedAt: number;
}

/** Public surface of the metrics registry. */
export interface Metrics {
  /**
   * Add `value` to a monotonic counter. Negative values are ignored —
   * use a gauge for values that go up and down.
   */
  counter(name: string, value: number, labels?: Labels): void;
  /**
   * Observe a sample for a histogram. Maintains sum, count, last, min,
   * and max. Bucketed quantiles (p50/p95/p99) are intentionally omitted
   * to keep the in-memory footprint bounded; add them later if needed.
   */
  histogram(name: string, value: number, labels?: Labels): void;
  /**
   * Set a gauge to an instantaneous value. Replaces the previous
   * reading (gauges are point-in-time, not cumulative).
   */
  gauge(name: string, value: number, labels?: Labels): void;
  /**
   * Return a JSON-serializable snapshot of every registered series,
   * keyed by `name` → `seriesKey` → state. Useful for `/api/health`
   * and `/api/metrics` debug endpoints.
   */
  snapshot(): Record<string, Record<SeriesKey, Omit<SeriesState, never>>>;
  /** Clear all state. Test-only. */
  reset(): void;
}

/** Stable serialization of a label set for use as a Map key. */
function labelsKey(name: string, labels: Labels | undefined): SeriesKey {
  if (!labels) return `${name}|`;
  const keys = Object.keys(labels).sort();
  const parts = keys.map(
    (k) => `${k}=${String(labels[k as keyof Labels])}`,
  );
  return `${name}|${parts.join(",")}`;
}

/** Build a fresh SeriesState for the given metric kind. */
function initSeries(kind: SeriesState["kind"], labels: Labels): SeriesState {
  const now = Date.now();
  return {
    kind,
    sum: 0,
    count: 0,
    last: 0,
    min: Number.POSITIVE_INFINITY,
    max: Number.NEGATIVE_INFINITY,
    labels: { ...labels },
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Build a fresh in-memory metrics registry. Each call returns a new
 * instance; the default export is a process-wide singleton returned by
 * `getMetrics()`.
 */
function buildMetrics(): Metrics {
  const store = new Map<SeriesKey, SeriesState>();

  const getOrCreate = (
    name: string,
    kind: SeriesState["kind"],
    labels?: Labels,
  ): SeriesState => {
    const key = labelsKey(name, labels);
    let s = store.get(key);
    if (!s) {
      s = initSeries(kind, labels ?? {});
      store.set(key, s);
    } else if (s.kind !== kind) {
      // Kind mismatch is a programmer error — counters and gauges share a
      // name space and have different semantics. Surface it loudly so we
      // catch accidental reuse during development.
      throw new Error(
        `Metrics: name "${name}" registered as ${s.kind}, cannot reuse as ${kind}`,
      );
    }
    return s;
  };

  return {
    counter(name, value, labels) {
      if (!Number.isFinite(value) || value < 0) return;
      const s = getOrCreate(name, "counter", labels);
      s.sum += value;
      s.last = s.sum;
      s.updatedAt = Date.now();
    },
    histogram(name, value, labels) {
      if (!Number.isFinite(value)) return;
      const s = getOrCreate(name, "histogram", labels);
      s.sum += value;
      s.count += 1;
      s.last = value;
      if (value < s.min) s.min = value;
      if (value > s.max) s.max = value;
      s.updatedAt = Date.now();
    },
    gauge(name, value, labels) {
      if (!Number.isFinite(value)) return;
      const s = getOrCreate(name, "gauge", labels);
      s.last = value;
      s.max = value;
      s.min = value;
      s.updatedAt = Date.now();
    },
    snapshot() {
      const out: Record<string, Record<SeriesKey, SeriesState>> = {};
      for (const [key, state] of store) {
        // key is `name|labels...` — split on the first `|` so multi-label
        // names don't get truncated.
        const idx = key.indexOf("|");
        const name = idx === -1 ? key : key.slice(0, idx);
        const seriesKey = idx === -1 ? "" : key.slice(idx + 1);
        (out[name] ??= {})[seriesKey] = {
          ...state,
          // Normalize min/max for series that never received a sample
          // (shouldn't happen, but defensive).
          min: state.count === 0 ? 0 : state.min,
          max: state.count === 0 ? 0 : state.max,
        };
      }
      return out;
    },
    reset() {
      store.clear();
    },
  };
}

/** Cached singleton. */
let cached: Metrics | null = null;

/**
 * Return the process-wide metrics registry. Idempotent; the same
 * `Metrics` instance is returned on every call.
 */
export function getMetrics(): Metrics {
  if (!cached) cached = buildMetrics();
  return cached;
}
