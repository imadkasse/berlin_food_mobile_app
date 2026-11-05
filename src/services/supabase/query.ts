/**
 * Shared query / mutation helpers for the Supabase service layer.
 *
 * These helpers exist so every service module behaves identically when it comes
 * to error handling and network resilience. They are deliberately free of any
 * UI copy: the fallback messages are neutral and can be overridden by callers.
 *
 * Ported from the web app's `client/src/api/*` conventions:
 * - PostgREST "0 rows" (`PGRST116`) is treated as "not found" → `null`.
 * - Every other error is thrown as a normalised `ServiceError`.
 */

import type { PostgrestSingleResponse } from '@supabase/postgrest-js';

/** Error shape produced by PostgREST / GoTrue / storage / raw fetch failures. */
export type ServiceErrorShape = {
  message: string;
  code?: string;
  status?: number;
  details?: string;
  hint?: string;
};

/**
 * Normalised error thrown by every service function.
 *
 * `code` keeps the original PostgREST code (e.g. `PGRST116`) and `status` keeps
 * the HTTP status when the failure came from a response.
 */
export class ServiceError extends Error {
  readonly code?: string;
  readonly status?: number;
  readonly details?: string;
  readonly hint?: string;

  constructor(shape: ServiceErrorShape) {
    super(shape.message);
    this.name = 'ServiceError';
    this.code = shape.code;
    this.status = shape.status;
    this.details = shape.details;
    this.hint = shape.hint;
    // Required so `instanceof` keeps working when compiled down to ES5.
    Object.setPrototypeOf(this, ServiceError.prototype);
  }
}

type PostgrestLikeError = {
  message?: unknown;
  code?: unknown;
  details?: unknown;
  hint?: unknown;
  status?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function readNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/**
 * Normalises anything thrown by Supabase (or by the platform) into a
 * `ServiceError`. Never throws itself.
 */
export function toServiceError(error: unknown, fallback = 'Unexpected error'): ServiceError {
  if (error instanceof ServiceError) {
    return error;
  }

  if (typeof error === 'string') {
    return new ServiceError({ message: error.length > 0 ? error : fallback });
  }

  if (error instanceof Error) {
    const code = readString((error as PostgrestLikeError).code);
    const status = readNumber((error as PostgrestLikeError).status);
    const details = readString((error as PostgrestLikeError).details);
    const hint = readString((error as PostgrestLikeError).hint);

    return new ServiceError({
      message: error.message.length > 0 ? error.message : fallback,
      code,
      status,
      details,
      hint,
    });
  }

  if (isRecord(error)) {
    const postgrest = error as PostgrestLikeError;
    const message = readString(postgrest.message) ?? fallback;

    return new ServiceError({
      message,
      code: readString(postgrest.code),
      status: readNumber(postgrest.status),
      details: readString(postgrest.details),
      hint: readString(postgrest.hint),
    });
  }

  return new ServiceError({ message: fallback });
}

/**
 * `true` when the error means "the row does not exist".
 *
 * PostgREST returns `PGRST116` (JSONPGRST116, "0 rows") when a `.single()`
 * query matches nothing — the web app treats this as `null` rather than an
 * error and the mobile client keeps the same behaviour.
 */
export function isNotFoundError(error: unknown): boolean {
  if (error === null || error === undefined) {
    return false;
  }

  if (isRecord(error)) {
    const code = readString((error as PostgrestLikeError).code);
    if (code === 'PGRST116' || code === 'JSONPGRST116') {
      return true;
    }

    const status = readNumber((error as PostgrestLikeError).status);
    if (status === 404) {
      return true;
    }
  }

  const message =
    error instanceof Error
      ? error.message
      : readString(isRecord(error) ? error.message : undefined);
  if (!message) {
    return false;
  }

  const normalized = message.toLowerCase();
  return (
    normalized.includes('0 rows') ||
    normalized.includes('no rows') ||
    normalized.includes('not found')
  );
}

const NETWORK_ERROR_MARKERS = [
  'network request failed',
  'failed to fetch',
  'err_network',
  'econnaborted',
  'econnreset',
  'econnrefused',
  'enetunreach',
  'ehostunreach',
  'socket hang up',
  'network error',
  'timeout',
  'timed out',
];

/**
 * `true` for transport-level failures.
 *
 * React Native's `fetch` rejects with `TypeError: Network request failed`;
 * browsers produce `TypeError: Failed to fetch`. Both are matched here.
 */
export function isNetworkError(error: unknown): boolean {
  if (error === null || error === undefined) {
    return false;
  }

  const candidate = error as PostgrestLikeError;
  const code = readString(candidate.code);
  if (code === 'ECONNABORTED' || code === 'ERR_NETWORK' || code === 'ETIMEDOUT') {
    return true;
  }

  const message = error instanceof Error ? error.message : readString(candidate.message);
  if (!message) {
    return false;
  }

  const normalized = message.toLowerCase();
  return NETWORK_ERROR_MARKERS.some((marker) => normalized.includes(marker));
}

/**
 * `true` when the failure is worth retrying: transport errors and 5xx
 * responses. Client errors (4xx) and "not found" are never retried.
 */
export function isRetryableError(error: unknown): boolean {
  if (isNotFoundError(error)) {
    return false;
  }

  if (isNetworkError(error)) {
    return true;
  }

  if (isRecord(error)) {
    const status = readNumber((error as PostgrestLikeError).status);
    if (status !== undefined) {
      return status >= 500;
    }
  }

  return false;
}

export type RetryOptions = {
  /** Total number of attempts (including the first one). Defaults to 3. */
  retries?: number;
  /** Base backoff delay in milliseconds. Defaults to 300ms. */
  baseDelayMs?: number;
  /** Custom predicate deciding whether an error should be retried. */
  shouldRetry?: (error: unknown) => boolean;
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Runs an operation with exponential backoff.
 *
 * Retryable failures (see `isRetryableError`) are retried up to `retries`
 * attempts using `baseDelayMs * 2^attempt`. The final error is re-thrown as a
 * `ServiceError`.
 */
export async function runWithRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const attempts = Math.max(1, options.retries ?? 3);
  const baseDelayMs = options.baseDelayMs ?? 300;
  const shouldRetry = options.shouldRetry ?? isRetryableError;

  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      const isLastAttempt = attempt === attempts - 1;
      if (isLastAttempt || !shouldRetry(error)) {
        throw toServiceError(error);
      }

      await delay(baseDelayMs * 2 ** attempt);
    }
  }

  throw toServiceError(lastError);
}

export type QueryOptions = {
  /** Neutral fallback message used when the failure carries no message. */
  fallbackMessage?: string;
  /** Whether transient network/5xx failures should be retried. Defaults to true. */
  retry?: boolean;
  /** Number of attempts when `retry` is enabled. Defaults to 3. */
  retries?: number;
  /** Base backoff delay in milliseconds. Defaults to 300ms. */
  baseDelayMs?: number;
};

/**
 * Shape of a PostgREST result accepted by the helpers below.
 *
 * `PostgrestSingleResponse<T>` is a discriminated union on `error`, so the
 * `data` is only read once we know the call succeeded.
 */
export type SupabaseResult<T> = PostgrestSingleResponse<T>;

function resolveOptions(options: QueryOptions) {
  return {
    retries: options.retries ?? 3,
    baseDelayMs: options.baseDelayMs ?? 300,
  };
}

/**
 * Executes a Supabase query and normalises its error.
 *
 * Mirrors the web app's `if (error) throw error;` behaviour, but the thrown
 * value is always a `ServiceError`.
 */
export async function query<T>(
  builder: () => PromiseLike<PostgrestSingleResponse<T>>,
  options: QueryOptions = {}
): Promise<T> {
  const run = async (): Promise<T> => {
    const response = await builder();
    if (response.error) {
      throw toServiceError(response.error, options.fallbackMessage);
    }
    return response.data;
  };

  if (options.retry === false) {
    return run();
  }

  const { retries, baseDelayMs } = resolveOptions(options);
  return runWithRetry(run, { retries, baseDelayMs });
}

/**
 * Like `query`, but treats a missing row (`PGRST116`) as `null` instead of an
 * error — the behaviour the web app relies on for `.single()` lookups.
 */
export async function fetchOrNull<T>(
  builder: () => PromiseLike<PostgrestSingleResponse<T>>,
  options: QueryOptions = {}
): Promise<T | null> {
  const run = async (): Promise<T | null> => {
    const response = await builder();
    if (response.error) {
      if (isNotFoundError(response.error)) {
        return null;
      }
      throw toServiceError(response.error, options.fallbackMessage);
    }
    return response.data ?? null;
  };

  if (options.retry === false) {
    return run();
  }

  const { retries, baseDelayMs } = resolveOptions(options);
  return runWithRetry(run, { retries, baseDelayMs });
}

/**
 * Executes a mutation (insert / update / delete) and normalises its error.
 */
export async function mutate<T>(
  operation: () => PromiseLike<PostgrestSingleResponse<T>>,
  options: QueryOptions = {}
): Promise<T> {
  const run = async (): Promise<T> => {
    const response = await operation();
    if (response.error) {
      throw toServiceError(response.error, options.fallbackMessage);
    }
    return response.data;
  };

  if (options.retry === false) {
    return run();
  }

  const { retries, baseDelayMs } = resolveOptions(options);
  return runWithRetry(run, { retries, baseDelayMs });
}

/**
 * Executes an operation that only reports an error (no payload), e.g. a
 * `delete()` without `.select()`.
 */
export async function mutateVoid(
  operation: () => PromiseLike<{ error: PostgrestLikeError | null }>,
  options: QueryOptions = {}
): Promise<void> {
  const run = async (): Promise<void> => {
    const response = await operation();
    if (response.error) {
      throw toServiceError(response.error, options.fallbackMessage);
    }
  };

  if (options.retry === false) {
    return run();
  }

  const { retries, baseDelayMs } = resolveOptions(options);
  return runWithRetry(run, { retries, baseDelayMs });
}
