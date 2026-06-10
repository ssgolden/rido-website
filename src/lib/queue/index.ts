/**
 * Public queue surface for the Rido backend.
 *
 * This module is the single entry point for every piece of code
 * that needs to enqueue background work, register a worker, or
 * wire completion / failure hooks. The rest of the app imports
 * `getQueue`, `closeQueue`, and the type aliases from here — never
 * from `./in-memory` directly — so we can swap the implementation
 * (e.g. for a Redis- or Postgres-backed queue) without touching
 * call sites.
 *
 * ## Singleton lifecycle
 *
 * The queue is a process-wide singleton created lazily on the
 * first call to {@link getQueue}. Workers and hooks registered
 * through that instance are shared by every caller in the same
 * Node process, which is the whole point: a `submit("send-email",
 * …)` from an API route handler is picked up by a worker
 * registered at module load.
 *
 * The singleton survives hot-reloads in `next dev` only as long as
 * the module itself is not re-evaluated; a re-evaluation rebuilds
 * the queue from scratch and any in-flight jobs are lost. This is
 * consistent with the in-memory cache's behaviour and is
 * acceptable for the best-effort, at-most-once semantics the
 * in-memory queue provides.
 *
 * ## Graceful shutdown
 *
 * {@link closeQueue} is the canonical "stop the world" entry
 * point. It calls {@link InMemoryJobQueue.close} on the active
 * queue, which:
 *
 *   1. Stops accepting new work (the drain loop will not start any
 *      more jobs).
 *   2. Cancels pending retry timers.
 *   3. Awaits every in-flight job, allowing the `onComplete` and
 *      `onFailure` hooks to fire.
 *   4. Resolves once the queue is fully idle.
 *
 * The function is idempotent and safe to call multiple times. A
 * subsequent {@link getQueue} call after `closeQueue` will return a
 * *fresh* queue (the singleton is rebuilt), which is the right
 * behaviour for test suites that want a clean slate between
 * cases.
 *
 * @module src/lib/queue
 */

import {
  InMemoryJobQueue,
  type Job,
  type JobHandler,
  type JobHook,
  type JobQueue,
  type JobStatus,
  type DeadLetter,
  type SubmitOptions,
  type SubmitResult,
} from "./in-memory";

// ─── Re-exports ────────────────────────────────────────────────────────────

/**
 * The default job queue implementation. Re-exported under its
 * concrete name so consumers that need access to the constructor
 * (for tests, custom configurations, or dependency injection)
 * can import it without reaching into `./in-memory` directly.
 */
export { InMemoryJobQueue };
/** Re-exported types — see {@link ./in-memory} for the definitions. */
export type {
  Job,
  JobHandler,
  JobHook,
  JobQueue,
  JobStatus,
  DeadLetter,
  SubmitOptions,
  SubmitResult,
};

// ─── Singleton ─────────────────────────────────────────────────────────────

/**
 * The active queue. Created on first {@link getQueue} call and
 * replaced by {@link closeQueue} (which also resets it to `null`
 * so a subsequent `getQueue` builds a fresh one). The variable
 * is module-local so the singleton truly is process-wide and
 * cannot be tampered with from outside.
 */
let activeQueue: JobQueue<unknown, unknown> | null = null;

/**
 * Return the process-wide job queue, building it on first call.
 *
 * The default configuration matches the in-memory implementation
 * defaults (concurrency 4, 1s base backoff, 3 max attempts). A
 * future dispatcher could read a `QUEUE_*` env var from
 * {@link getEnv} to pick concurrency or pick between backends;
 * for now the swap is a one-line edit here.
 *
 * @returns The shared {@link JobQueue} instance.
 *
 * @example
 * ```ts
 * import { getQueue } from "@/lib/queue";
 *
 * const queue = getQueue();
 * queue.onStart("send-email", async (job) => {
 *   await mailer.send(job.payload as { to: string });
 * });
 * void queue.processLoop();
 * ```
 */
export function getQueue(): JobQueue<unknown, unknown> {
  if (!activeQueue) {
    activeQueue = new InMemoryJobQueue<unknown, unknown>();
  }
  return activeQueue;
}

/**
 * Stop the queue and rebuild it on the next {@link getQueue} call.
 *
 * "Stop" means: no new jobs are started, pending retry timers are
 * cancelled, and the returned promise resolves only after every
 * in-flight worker has finished. Workers that are mid-execution
 * are not interrupted — that would require handler-level
 * cancellation, which is out of scope for the in-memory
 * implementation.
 *
 * Use this from shutdown hooks (e.g. `process.on("SIGTERM", …)`)
 * and from test `afterEach` blocks. It is safe to call when the
 * queue has not been started yet (it's a no-op in that case).
 *
 * @returns A promise that resolves once the queue is idle.
 *
 * @example
 * ```ts
 * // In a shutdown handler:
 * process.on("SIGTERM", async () => {
 *   await closeQueue();
 *   process.exit(0);
 * });
 * ```
 */
export async function closeQueue(): Promise<void> {
  if (!activeQueue) return;
  const current = activeQueue;
  // Reset the singleton *before* awaiting, so a re-entrant
  // `getQueue()` from a hook inside `close()` (e.g. an onFailure
  // hook that wants to re-submit) does not deadlock on the same
  // instance we are about to drain.
  activeQueue = null;
  await current.close();
}

/**
 * Test-only escape hatch. Drops the singleton so a subsequent
 * {@link getQueue} builds a fresh, empty queue.
 *
 * Production code must never call this. The double-underscore
 * name marks it as an internal API that may change or be removed
 * without a deprecation cycle.
 */
export function __resetQueueForTests(): void {
  activeQueue = null;
}
