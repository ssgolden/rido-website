/**
 * Structured JSON logger for Rido.
 *
 * Hand-rolled, pino-shaped logger. No external dependency. Emits one JSON
 * object per line on stdout (or stderr for `fatal`), so logs can be shipped
 * to any log aggregator (Datadog, Logflare, CloudWatch, etc.) without parsing.
 *
 * Level ordering: trace < debug < info < warn < error < fatal
 * Threshold is read from `process.env.LOG_LEVEL` (validated by `getEnv()`
 * in `@/lib/contract`). When unset, defaults to `info`.
 *
 * Each log line is a JSON object of the shape:
 *   { "level": "info", "time": "2024-01-01T00:00:00.000Z", "msg": "...", ...bindings }
 *
 * `child(bindings)` returns a new logger with extra bound fields, matching
 * pino's API.
 *
 * @module observability/logger
 */
import { getEnv } from "@/lib/contract";

/** Numeric ranking of each log level. Lower is more verbose. */
export const LOG_LEVEL_RANK = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
} as const;

export type LogLevel = keyof typeof LOG_LEVEL_RANK;

/** Bound fields attached to every log line emitted by a logger instance. */
export type LogBindings = Record<string, unknown>;

/** A single log argument set passed to one of the level methods. */
export type LogArgs =
  | [string]
  | [string, LogBindings]
  | [Error]
  | [Error, string]
  | [Error, string, LogBindings]
  | [LogBindings, string]
  | [string, Error];

/** The minimal surface a logger must expose. */
export interface Logger {
  trace(...args: LogArgs): void;
  debug(...args: LogArgs): void;
  info(...args: LogArgs): void;
  warn(...args: LogArgs): void;
  error(...args: LogArgs): void;
  fatal(...args: LogArgs): void;
  /**
   * Return a child logger that inherits this logger's bindings merged with
   * the supplied extra bindings. Child loggers do not mutate the parent.
   */
  child(bindings: LogBindings): Logger;
}

/** Resolve the active minimum level from env, falling back to `info`. */
function resolveLevel(): LogLevel {
  // Lazy-read env; getEnv() validates, but we tolerate the logger being
  // imported before env is fully populated (e.g. in tests) by reading the
  // raw env var as a fallback.
  try {
    return getEnv().LOG_LEVEL;
  } catch {
    const raw = process.env.LOG_LEVEL?.toLowerCase();
    if (raw && raw in LOG_LEVEL_RANK) return raw as LogLevel;
    return "info";
  }
}

/**
 * Format a single argument list into a normalized record ready for JSON
 * serialization. Handles the common pino-style overloads:
 *   - "message"
 *   - { ...bindings }, "message"
 *   - "message", { ...bindings }
 *   - new Error("...")
 *   - new Error("..."), "context message"
 *   - new Error("..."), "context message", { ...bindings }
 */
function normalizeArgs(
  args: LogArgs,
  level: LogLevel,
): { msg: string; bindings: LogBindings } {
  let msg = "";
  let bindings: LogBindings = {};

  const first = args[0] as unknown;

  if (args.length === 1) {
    if (first instanceof Error) {
      msg = first.message;
      bindings = { err: serializeError(first) };
    } else if (typeof first === "string") {
      msg = first;
    } else if (typeof first === "object" && first !== null) {
      bindings = { ...(first as LogBindings) };
      msg = (bindings.msg as string) ?? "";
      delete bindings.msg;
    }
  } else if (args.length === 2) {
    const second = args[1] as unknown;
    if (first instanceof Error) {
      msg = typeof second === "string" ? second : first.message;
      bindings = { err: serializeError(first) };
    } else if (typeof first === "string" && typeof second === "object") {
      msg = first;
      bindings = { ...(second as LogBindings) };
      if (bindings.err instanceof Error) {
        bindings.err = serializeError(bindings.err as Error);
      }
    } else if (typeof first === "object" && typeof second === "string") {
      bindings = { ...(first as LogBindings) };
      msg = (bindings.msg as string) ?? second;
      delete bindings.msg;
      if (bindings.err instanceof Error) {
        bindings.err = serializeError(bindings.err as Error);
      }
    }
  } else if (args.length >= 3) {
    const err = first instanceof Error ? first : undefined;
    const contextMsg = args[1];
    const extra = args[2] as LogBindings | undefined;
    msg = typeof contextMsg === "string" ? contextMsg : "";
    bindings = { ...(extra ?? {}) };
    if (bindings.err instanceof Error) {
      bindings.err = serializeError(bindings.err as Error);
    }
    if (err) bindings.err = serializeError(err);
  }

  // Tag the level so downstream consumers can filter without re-parsing.
  bindings.level = level;
  return { msg, bindings };
}

/**
 * Serialize an Error into a plain object suitable for JSON output. Pulls
 * `name`, `message`, and `stack`, and copies any custom enumerable
 * properties (e.g. `code`, `statusCode` on Postgres or fetch errors).
 */
function serializeError(err: Error): LogBindings {
  const out: LogBindings = {
    name: err.name,
    message: err.message,
  };
  if (err.stack) out.stack = err.stack;
  for (const key of Object.getOwnPropertyNames(err)) {
    if (key === "name" || key === "message" || key === "stack") continue;
    const value = (err as unknown as Record<string, unknown>)[key];
    if (value !== undefined) out[key] = value;
  }
  return out;
}

/**
 * Write one log record to the appropriate stream. `fatal` goes to stderr
 * because something has gone catastrophically wrong and we want it surfaced
 * even if stdout is being piped/redirected.
 */
function emit(level: LogLevel, record: Record<string, unknown>): void {
  const line = JSON.stringify(record) + "\n";
  if (level === "fatal" || level === "error") {
    process.stderr.write(line);
  } else {
    process.stdout.write(line);
  }
}

/**
 * Build a logger instance bound to a set of parent bindings. The internal
 * threshold is captured at construction time so that toggling `LOG_LEVEL`
 * at runtime requires a fresh `getLogger()` call (this matches pino).
 */
function buildLogger(
  bindings: LogBindings,
  threshold: LogLevel,
): Logger {
  const shouldEmit = (level: LogLevel): boolean =>
    LOG_LEVEL_RANK[level] >= LOG_LEVEL_RANK[threshold];

  const log = (level: LogLevel) =>
    (...args: LogArgs) => {
      if (!shouldEmit(level)) return;
      const { msg, bindings: extra } = normalizeArgs(args, level);
      // Pino uses `time` for the ISO timestamp; we keep that name for
      // drop-in compatibility with log shippers that expect it.
      const record: Record<string, unknown> = {
        time: new Date().toISOString(),
        level,
        msg,
        ...bindings,
        ...extra,
      };
      emit(level, record);
    };

  return {
    trace: log("trace"),
    debug: log("debug"),
    info: log("info"),
    warn: log("warn"),
    error: log("error"),
    fatal: log("fatal"),
    child(extra: LogBindings): Logger {
      return buildLogger({ ...bindings, ...extra }, threshold);
    },
  };
}

/** Cached root logger; rebuilt only when LOG_LEVEL changes. */
let cached: { threshold: LogLevel; logger: Logger } | null = null;

/**
 * Return the process-wide logger. First call resolves the level from
 * `process.env.LOG_LEVEL` (validated via `getEnv()`); subsequent calls
 * reuse the same instance unless the env var has changed.
 */
export function getLogger(): Logger {
  const threshold = resolveLevel();
  if (cached && cached.threshold === threshold) return cached.logger;
  const logger = buildLogger({}, threshold);
  cached = { threshold, logger };
  return logger;
}

/**
 * Reset the cached logger. Test-only escape hatch — production code should
 * never need this because `getEnv()` is itself memoized.
 */
export function _resetLoggerForTests(): void {
  cached = null;
}
