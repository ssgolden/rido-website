// Smoke test: exercises the observability module end-to-end.
// Run with: node --experimental-strip-types scripts/smoke-observability.mts
// (or tsx) — kept out of the project test runner for the parent agent's
// build to remain untouched.

import { getLogger } from "../src/lib/observability/logger";
import { getMetrics } from "../src/lib/observability/metrics";
import { captureError } from "../src/lib/observability/errors";

const log = getLogger();
log.info("hello info");
log.debug({ userId: 42 }, "debug with bindings");
log.warn("warn line");

const child = log.child({ requestId: "req-1", route: "/api/test" });
child.info("from child logger");

// Error path
const e = captureError(new Error("boom"), { route: "/x" });
console.error("captured:", e.message);

// Metrics
const m = getMetrics();
m.counter("http_requests_total", 1, { route: "/a", status: "200" });
m.counter("http_requests_total", 1, { route: "/a", status: "200" });
m.histogram("http_request_ms", 123, { route: "/a" });
m.histogram("http_request_ms", 7, { route: "/a" });
m.gauge("active_connections", 3);
console.log("snapshot:", JSON.stringify(m.snapshot(), null, 2));

// Level gating
process.env.LOG_LEVEL = "warn";
import("../src/lib/observability/logger").then((mod) => {
  mod._resetLoggerForTests();
  const log2 = mod.getLogger();
  log2.info("this should be filtered");
  log2.warn("this should appear");
});
