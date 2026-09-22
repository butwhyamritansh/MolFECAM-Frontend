'use client'

import ForgettingChart from '@/components/ForgettingChart'
import { getMetrics } from '@/lib/api'
import { useApiResource } from '@/hooks/useApiResource'
import { Badge, Card, ErrorNote, SectionHeading } from '@/components/ui'
import type { MetricsResponse } from '@/types/api'

/**
 * Catastrophic-forgetting measures from the last incremental training run.
 *
 * Fetched once with a slow refresh and a failure cap — the previous version
 * polled every 5 seconds indefinitely, including while the backend was down.
 */
export default function ForgettingMetrics() {
  const { data, error, initialLoading, reload } = useApiResource<MetricsResponse>(
    ({ signal }) => getMetrics({ signal }),
    { intervalMs: 60_000, maxFailures: 3 },
  )

  return (
    <Card className="p-5 sm:p-6">
      <SectionHeading
        title="Catastrophic forgetting"
        description="How much accuracy each task lost after later tasks were learned. Lower is better."
        action={data?.demo ? <Badge tone="warning">Synthetic</Badge> : undefined}
      />

      <div className="mt-4">
        {initialLoading && <ChartSkeleton />}

        {!initialLoading && error && <ErrorNote message={error} onRetry={reload} />}

        {!initialLoading && !error && data && !data.available && (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {data.message ?? 'No training metrics are available yet.'}
          </p>
        )}

        {!initialLoading && !error && data?.available && (
          <>
            <ForgettingChart metrics={data.metrics} />
            <p className="mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              {data.demo
                ? 'Illustrative values — the backend is running in demo mode.'
                : data.generated_at
                  ? `From the training run of ${new Date(data.generated_at).toLocaleString()}.`
                  : 'From the most recent training run.'}
            </p>
          </>
        )}
      </div>
    </Card>
  )
}

function ChartSkeleton() {
  return (
    <div className="space-y-2.5" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="skeleton h-3 w-16 rounded" />
          <div
            className="skeleton h-3 rounded-full"
            style={{ width: `${30 + ((index * 17) % 55)}%` }}
          />
        </div>
      ))}
    </div>
  )
}
