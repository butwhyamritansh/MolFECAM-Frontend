'use client'

import { useMemo, useState } from 'react'

import { useElementWidth } from '@/hooks/useElementWidth'
import { decimal, percent } from '@/lib/format'
import type { TaskMetric } from '@/types/api'

const SERIES = [
  { key: 'forgetting_label' as const, name: 'Clinical toxicity', color: 'var(--series-1)' },
  { key: 'forgetting_fda' as const, name: 'FDA approval', color: 'var(--series-2)' },
]

const BAR_GAP = 2 // the 2px surface gap between adjacent fills
const TOP_PAD = 8

/** Geometry that adapts to the rendered width, so type never shrinks. */
function layoutFor(width: number) {
  const compact = width < 460
  return {
    rowHeight: compact ? 34 : 40,
    barHeight: compact ? 10 : 12,
    labelWidth: compact ? 56 : 86,
    rightPad: compact ? 40 : 58,
    categoryFont: compact ? 10 : 12,
    valueFont: compact ? 9 : 11,
    tickFont: compact ? 9 : 11,
    // Below this width the per-bar value labels collide with the bars.
    showValueLabels: width >= 360,
  }
}

interface HoverState {
  dataset: string
  series: string
  value: number
  x: number
  y: number
}

/**
 * Forgetting measure per task, one grouped horizontal bar pair per dataset.
 *
 * Magnitude by identity across an ordered task sequence — bars rather than a
 * line, because the datasets are distinct tasks, not samples of a continuum.
 */
export default function ForgettingChart({ metrics }: { metrics: TaskMetric[] }) {
  const [hover, setHover] = useState<HoverState | null>(null)
  const [showTable, setShowTable] = useState(false)
  const { ref, width: measured } = useElementWidth<HTMLDivElement>()

  const rows = useMemo(
    () => metrics.filter((m) => m.forgetting_label != null || m.forgetting_fda != null),
    [metrics],
  )

  const max = useMemo(() => {
    const values = rows.flatMap((row) =>
      SERIES.map((series) => row[series.key]).filter((v): v is number => v != null),
    )
    // Round the domain up to a clean tick so the axis reads sensibly.
    const peak = values.length ? Math.max(...values) : 0.1
    return Math.max(Math.ceil(peak * 20) / 20, 0.05)
  }, [rows])

  if (!rows.length) {
    return (
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        No per-task measures were recorded in the last training run.
      </p>
    )
  }

  const width = Math.round(Math.min(Math.max(measured, 280), 900))
  const {
    rowHeight: ROW_HEIGHT,
    barHeight: BAR_HEIGHT,
    labelWidth: LABEL_WIDTH,
    rightPad: RIGHT_PAD,
    categoryFont,
    valueFont,
    tickFont,
    showValueLabels,
  } = layoutFor(width)
  const height = TOP_PAD + rows.length * ROW_HEIGHT + 24
  const plotWidth = width - LABEL_WIDTH - RIGHT_PAD
  // Four ticks are unreadable on a narrow canvas.
  const tickFractions = width < 460 ? [0, 0.5, 1] : [0, 0.25, 0.5, 0.75, 1]
  const ticks = tickFractions.map((fraction) => fraction * max)

  return (
    <div ref={ref}>
      {/* Legend — always present for two or more series. */}
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {SERIES.map((series) => (
          <span
            key={series.key}
            className="inline-flex items-center gap-1.5 text-xs"
            style={{ color: 'var(--text-secondary)' }}
          >
            <span
              aria-hidden="true"
              style={{ background: series.color }}
              className="inline-block h-2.5 w-2.5 rounded-sm"
            />
            {series.name}
          </span>
        ))}
        <button
          type="button"
          onClick={() => setShowTable((value) => !value)}
          style={{ color: 'var(--text-secondary)' }}
          className="ml-auto text-xs underline underline-offset-2 hover:opacity-75"
        >
          {showTable ? 'Show chart' : 'Show table'}
        </button>
      </div>

      {showTable ? (
        <MetricsTable rows={rows} />
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            width="100%"
            height={height}
            role="img"
            aria-label={`Forgetting measure for ${rows.length} tasks, two series. Use the table view for exact values.`}
          >
            {/* Recessive grid */}
            {ticks.map((tick, index) => {
              const x = LABEL_WIDTH + (tick / max) * plotWidth
              return (
                <g key={index}>
                  <line
                    x1={x}
                    y1={TOP_PAD}
                    x2={x}
                    y2={TOP_PAD + rows.length * ROW_HEIGHT}
                    stroke="var(--border-subtle)"
                    strokeWidth={1}
                  />
                  <text
                    x={x}
                    y={height - 8}
                    textAnchor="middle"
                    fontSize={tickFont}
                    fill="var(--text-muted)"
                  >
                    {decimal(tick, 2)}
                  </text>
                </g>
              )
            })}

            {rows.map((row, rowIndex) => {
              const rowTop = TOP_PAD + rowIndex * ROW_HEIGHT
              const groupHeight = SERIES.length * BAR_HEIGHT + BAR_GAP
              const groupTop = rowTop + (ROW_HEIGHT - groupHeight) / 2

              return (
                <g key={row.dataset}>
                  <text
                    x={LABEL_WIDTH - 10}
                    y={rowTop + ROW_HEIGHT / 2 + 3.5}
                    textAnchor="end"
                    fontSize={categoryFont}
                    fill="var(--text-secondary)"
                  >
                    {row.dataset}
                  </text>

                  {SERIES.map((series, seriesIndex) => {
                    const value = row[series.key]
                    if (value == null) return null
                    const barWidth = Math.max((value / max) * plotWidth, 2)
                    const y = groupTop + seriesIndex * (BAR_HEIGHT + BAR_GAP)

                    return (
                      <g key={series.key}>
                        {/* Wider invisible hit target than the 10px bar. */}
                        <rect
                          x={LABEL_WIDTH}
                          y={y - 2}
                          width={plotWidth}
                          height={BAR_HEIGHT + 4}
                          fill="transparent"
                          onMouseEnter={() =>
                            setHover({
                              dataset: row.dataset,
                              series: series.name,
                              value,
                              x: LABEL_WIDTH + barWidth,
                              y,
                            })
                          }
                          onMouseLeave={() => setHover(null)}
                        />
                        <rect
                          x={LABEL_WIDTH}
                          y={y}
                          width={barWidth}
                          height={BAR_HEIGHT}
                          rx={4}
                          fill={series.color}
                          opacity={
                            hover && hover.dataset === row.dataset && hover.series === series.name
                              ? 1
                              : hover
                                ? 0.55
                                : 1
                          }
                          pointerEvents="none"
                        />
                        {/* Direct label — two series, so both are labelled.
                            Dropped on very narrow canvases, where the table
                            view carries the exact numbers instead. */}
                        {showValueLabels && (
                          <text
                            x={LABEL_WIDTH + barWidth + 5}
                            y={y + BAR_HEIGHT - 1.5}
                            fontSize={valueFont}
                            fill="var(--text-muted)"
                            pointerEvents="none"
                          >
                            {decimal(value, 3)}
                          </text>
                        )}
                      </g>
                    )
                  })}
                </g>
              )
            })}
          </svg>

          {hover && (
            <div
              role="status"
              style={{
                background: 'var(--surface-1)',
                borderColor: 'var(--border-strong)',
                boxShadow: 'var(--shadow-lift)',
                left: `${(hover.x / width) * 100}%`,
                top: `${(hover.y / height) * 100}%`,
              }}
              className="pointer-events-none absolute z-10 -translate-y-1/2 translate-x-2 rounded-lg border px-2.5 py-1.5 text-xs whitespace-nowrap"
            >
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {hover.dataset}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {' '}
                · {hover.series}: {decimal(hover.value, 4)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MetricsTable({ rows }: { rows: TaskMetric[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr style={{ color: 'var(--text-muted)' }}>
            <th className="py-2 pr-3 font-medium">Task</th>
            <th className="py-2 pr-3 font-medium">Forgetting (toxicity)</th>
            <th className="py-2 pr-3 font-medium">Forgetting (FDA)</th>
            <th className="py-2 pr-3 font-medium">Final acc. (toxicity)</th>
            <th className="py-2 font-medium">Final acc. (FDA)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.dataset} className="border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <td className="py-2 pr-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                {row.dataset}
              </td>
              <td className="py-2 pr-3 tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                {decimal(row.forgetting_label, 4)}
              </td>
              <td className="py-2 pr-3 tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                {decimal(row.forgetting_fda, 4)}
              </td>
              <td className="py-2 pr-3 tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                {percent(row.anytime_accuracy_label)}
              </td>
              <td className="py-2 tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                {percent(row.anytime_accuracy_fda)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
