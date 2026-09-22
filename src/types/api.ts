/**
 * Wire types for the MolFECAM API.
 *
 * These mirror `backend/app/schemas.py` field for field. If you change one,
 * change the other.
 */

export interface HeadPrediction {
  head: string
  class_index: number
  class_name: string
  /** 0–1 softmax probability of the predicted class. */
  confidence: number
  probabilities: number[]
}

export interface MoleculePrediction {
  smiles: string
  valid: boolean
  canonical_smiles: string | null
  error: string | null
  demo: boolean
  predictions: Record<string, HeadPrediction>
}

export interface PredictResponse {
  results: MoleculePrediction[]
  requested: number
  scored: number
  rejected: number
  demo: boolean
}

export interface HeadInfo {
  key: string
  label: string
  description: string
  classes: string[]
  /** Class index worth drawing attention to, e.g. "Toxic". */
  alert_class: number | null
}

export interface HeadsResponse {
  heads: HeadInfo[]
}

export interface TaskMetric {
  dataset: string
  forgetting_label: number | null
  forgetting_fda: number | null
  anytime_accuracy_label: number | null
  anytime_accuracy_fda: number | null
}

export interface MetricsResponse {
  available: boolean
  demo: boolean
  generated_at: string | null
  order: string[]
  metrics: TaskMetric[]
  message: string | null
}

export interface HealthResponse {
  status: 'ok' | 'degraded'
  version: string
  model: {
    ready: boolean
    demo: boolean
    loaded: boolean
    device: string | null
    encoder: string | null
    checkpoint: string | null
    error: string | null
  }
  rdkit: boolean
  max_batch: number
}
