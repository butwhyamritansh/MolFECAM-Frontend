/** Display helpers shared across components. */

export function percent(value: number | null | undefined, digits = 1): string {
  if (value == null || Number.isNaN(value)) return '—'
  return `${(value * 100).toFixed(digits)}%`
}

export function decimal(value: number | null | undefined, digits = 3): string {
  if (value == null || Number.isNaN(value)) return '—'
  return value.toFixed(digits)
}

/** Confidence bands used for the textual qualifier beside each bar. */
export function confidenceBand(confidence: number): 'low' | 'moderate' | 'high' {
  if (confidence >= 0.85) return 'high'
  if (confidence >= 0.6) return 'moderate'
  return 'low'
}

export function truncateMiddle(text: string, max = 44): string {
  if (text.length <= max) return text
  const half = Math.floor((max - 1) / 2)
  return `${text.slice(0, half)}…${text.slice(-half)}`
}
