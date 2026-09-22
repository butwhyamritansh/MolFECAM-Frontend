/**
 * Typed client for the MolFECAM API.
 *
 * Every call goes through `request()`, which centralises the base URL, the
 * abort timeout and error shaping. The previous version hard-coded
 * `http://localhost:8000` inside components, which meant the app could only
 * ever work on one developer's machine.
 */

import type {
  HeadsResponse,
  HealthResponse,
  MetricsResponse,
  PredictResponse,
} from '@/types/api'

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
).replace(/\/+$/, '')

const DEFAULT_TIMEOUT_MS = 30_000

/** An API failure carrying enough context for the UI to explain itself. */
export class ApiError extends Error {
  readonly status: number
  readonly isNetworkError: boolean

  constructor(message: string, status = 0, isNetworkError = false) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.isNetworkError = isNetworkError
  }
}

interface RequestOptions {
  signal?: AbortSignal
  timeoutMs?: number
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  { signal, timeoutMs = DEFAULT_TIMEOUT_MS }: RequestOptions = {},
): Promise<T> {
  const timeout = AbortSignal.timeout(timeoutMs)
  // Abort if either the caller cancels or the request runs long.
  const composed = signal ? AbortSignal.any([signal, timeout]) : timeout

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: composed,
      headers: { Accept: 'application/json', ...init.headers },
    })
  } catch (error) {
    if (signal?.aborted) throw error
    const timedOut = error instanceof DOMException && error.name === 'TimeoutError'
    throw new ApiError(
      timedOut
        ? `The API did not respond within ${Math.round(timeoutMs / 1000)}s.`
        : `Could not reach the API at ${API_BASE_URL}.`,
      0,
      true,
    )
  }

  if (!response.ok) {
    throw new ApiError(await readErrorDetail(response), response.status)
  }

  return (await response.json()) as T
}

/** FastAPI reports errors as `{detail: string | ValidationError[]}`. */
async function readErrorDetail(response: Response): Promise<string> {
  try {
    const body = await response.json()
    const detail = body?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) => item?.msg)
        .filter((msg): msg is string => typeof msg === 'string')
      if (messages.length) return messages.join('; ')
    }
  } catch {
    // Fall through to the generic message below.
  }
  return `Request failed with status ${response.status}.`
}

export function predict(smiles: string[], options?: RequestOptions) {
  return request<PredictResponse>(
    '/predict',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ smiles }),
    },
    options,
  )
}

export function getHeads(options?: RequestOptions) {
  return request<HeadsResponse>('/heads', {}, { timeoutMs: 8_000, ...options })
}

export function getMetrics(options?: RequestOptions) {
  return request<MetricsResponse>(
    '/metrics/forgetting',
    {},
    { timeoutMs: 8_000, ...options },
  )
}

export function getHealth(options?: RequestOptions) {
  return request<HealthResponse>('/health', {}, { timeoutMs: 5_000, ...options })
}
