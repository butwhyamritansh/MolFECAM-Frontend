'use client'

import { useState } from 'react'

import { confidenceBand, percent } from '@/lib/format'
import { Badge, Card } from '@/components/ui'
import type { HeadInfo, MoleculePrediction } from '@/types/api'

const BAND_LABEL = {
  high: 'high confidence',
  moderate: 'moderate confidence',
  low: 'low confidence',
} as const

interface PredictionCardProps {
  result: MoleculePrediction
  heads: HeadInfo[]
  index: number
}

export default function PredictionCard({ result, heads, index }: PredictionCardProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.canonical_smiles ?? result.smiles)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard access can be denied; the SMILES is still selectable */
    }
  }

  return (
    <Card className="overflow-hidden">
      <div
        className="flex items-start justify-between gap-3 border-b px-4 py-3"
        style={{ background: 'var(--surface-2)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
              #{index + 1}
            </span>
            {!result.valid && <Badge tone="critical">Invalid</Badge>}
            {result.demo && <Badge tone="warning">Demo</Badge>}
          </div>
          <p
            className="mt-1 font-mono text-sm break-all"
            style={{ color: 'var(--text-primary)' }}
            title={result.smiles}
          >
            {result.smiles}
          </p>
          {result.canonical_smiles && result.canonical_smiles !== result.smiles && (
            <p className="mt-0.5 font-mono text-xs break-all" style={{ color: 'var(--text-muted)' }}>
              canonical: {result.canonical_smiles}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={copy}
          style={{ color: 'var(--text-secondary)' }}
          className="shrink-0 text-xs underline underline-offset-2 hover:opacity-75"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {result.valid ? (
        <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
          {heads.map((head) => {
            const prediction = result.predictions[head.key]
            if (!prediction) return null

            const isAlert = head.alert_class === prediction.class_index
            const band = confidenceBand(prediction.confidence)

            return (
              <div key={head.key} className="px-4 py-3.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span
                    className="text-xs font-medium tracking-wide uppercase"
                    style={{ color: 'var(--text-muted)' }}
                    title={head.description}
                  >
                    {head.label}
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{
                      color: isAlert ? 'var(--status-critical)' : 'var(--text-primary)',
                    }}
                  >
                    {prediction.class_name}
                  </span>
                </div>

                {/* Confidence bar. The value is also printed, so the reading
                    never depends on the bar's length or colour alone. */}
                <div className="mt-2 flex items-center gap-2.5">
                  <div
                    className="h-1.5 flex-1 overflow-hidden rounded-full"
                    style={{ background: 'var(--surface-2)' }}
                    role="img"
                    aria-label={`${percent(prediction.confidence)} ${BAND_LABEL[band]}`}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(prediction.confidence * 100, 2)}%`,
                        background: isAlert ? 'var(--status-critical)' : 'var(--accent)',
                      }}
                    />
                  </div>
                  <span
                    className="w-24 shrink-0 text-right text-xs tabular-nums"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {percent(prediction.confidence)} {band}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="px-4 py-3.5 text-sm" style={{ color: 'var(--status-critical)' }}>
          {result.error ?? 'This molecule could not be parsed.'}
        </p>
      )}
    </Card>
  )
}
