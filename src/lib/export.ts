/** Download prediction results as CSV or JSON. */

import type { HeadInfo, MoleculePrediction } from '@/types/api'

function download(content: string, filename: string, mime: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: mime }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  // Revoking immediately can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function csvCell(value: unknown): string {
  const text = value == null ? '' : String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv(results: MoleculePrediction[], heads: HeadInfo[]): string {
  const header = [
    'smiles',
    'canonical_smiles',
    'valid',
    'error',
    ...heads.flatMap((head) => [`${head.key}_prediction`, `${head.key}_confidence`]),
  ]

  const rows = results.map((result) => [
    result.smiles,
    result.canonical_smiles ?? '',
    result.valid,
    result.error ?? '',
    ...heads.flatMap((head) => {
      const prediction = result.predictions[head.key]
      return prediction
        ? [prediction.class_name, prediction.confidence.toFixed(4)]
        : ['', '']
    }),
  ])

  return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')
}

const stamp = () => new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')

export function downloadCsv(results: MoleculePrediction[], heads: HeadInfo[]): void {
  download(toCsv(results, heads), `molfecam-predictions-${stamp()}.csv`, 'text/csv')
}

export function downloadJson(results: MoleculePrediction[]): void {
  download(
    JSON.stringify(results, null, 2),
    `molfecam-predictions-${stamp()}.json`,
    'application/json',
  )
}
