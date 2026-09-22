'use client'

import { useCallback, useEffect, useState } from 'react'

import { ApiError } from '@/lib/api'

export interface ResourceState<T> {
  data: T | null
  error: string | null
  loading: boolean
  /** True only for the very first load, so refreshes don't flash a skeleton. */
  initialLoading: boolean
  reload: () => void
}

/**
 * Fetch a resource once on mount, with an optional refresh interval.
 *
 * The previous ForgettingMetrics component polled every 5 seconds forever and
 * kept re-rendering its own error, hammering a backend that was down. This
 * stops polling after repeated failures and exposes a manual retry instead.
 */
export function useApiResource<T>(
  fetcher: (options: { signal: AbortSignal }) => Promise<T>,
  { intervalMs, maxFailures = 3 }: { intervalMs?: number; maxFailures?: number } = {},
): ResourceState<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [nonce, setNonce] = useState(0)

  const reload = useCallback(() => setNonce((value) => value + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout> | undefined
    let failures = 0
    let cancelled = false

    const run = async () => {
      setLoading(true)
      try {
        const result = await fetcher({ signal: controller.signal })
        if (cancelled) return
        failures = 0
        setData(result)
        setError(null)
      } catch (caught) {
        if (cancelled || controller.signal.aborted) return
        failures += 1
        setError(
          caught instanceof ApiError ? caught.message : 'Something went wrong.',
        )
      } finally {
        if (!cancelled) {
          setLoading(false)
          setInitialLoading(false)
        }
      }

      // Back off rather than polling a backend that is clearly down.
      if (!cancelled && intervalMs && failures < maxFailures) {
        timer = setTimeout(run, intervalMs)
      }
    }

    void run()
    return () => {
      cancelled = true
      controller.abort()
      if (timer) clearTimeout(timer)
    }
    // `fetcher` is expected to be a stable module-level function.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce, intervalMs, maxFailures])

  return { data, error, loading, initialLoading, reload }
}
