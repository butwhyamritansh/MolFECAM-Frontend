'use client'

import { API_BASE_URL, getHealth } from '@/lib/api'
import { useApiResource } from '@/hooks/useApiResource'
import { Badge } from '@/components/ui'
import type { HealthResponse } from '@/types/api'

/**
 * Live indicator for backend reachability.
 *
 * Without this, a stopped backend showed up only as a silent `console.error`
 * from the submit handler.
 */
export default function ApiStatus() {
  const { data, error, initialLoading } = useApiResource<HealthResponse>(
    ({ signal }) => getHealth({ signal }),
    { intervalMs: 30_000, maxFailures: 4 },
  )

  if (initialLoading) {
    return <Badge tone="neutral">Checking API…</Badge>
  }

  if (error || !data) {
    return (
      <Badge tone="critical" title={`${error ?? 'Unreachable'} — ${API_BASE_URL}`}>
        <Dot color="var(--status-critical)" /> API offline
      </Badge>
    )
  }

  if (data.model.demo) {
    return (
      <Badge tone="warning" title="The backend is serving synthetic predictions.">
        <Dot color="var(--status-warning)" /> Demo mode
      </Badge>
    )
  }

  if (!data.model.ready) {
    return (
      <Badge tone="warning" title={data.model.error ?? 'The model is not loaded.'}>
        <Dot color="var(--status-warning)" /> Model not loaded
      </Badge>
    )
  }

  return (
    <Badge tone="good" title={`v${data.version} · ${data.model.device ?? 'cpu'}`}>
      <Dot color="var(--status-good)" /> API ready
    </Badge>
  )
}

function Dot({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      style={{ background: color }}
      className="inline-block h-1.5 w-1.5 rounded-full"
    />
  )
}
