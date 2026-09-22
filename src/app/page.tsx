'use client'

import { useCallback, useState } from 'react'

import ApiStatus from '@/components/ApiStatus'
import ForgettingMetrics from '@/components/ForgettingMetrics'
import InputForm from '@/components/InputForm'
import ResultsPanel from '@/components/ResultsPanel'
import ThemeToggle from '@/components/ThemeToggle'
import { ApiError, predict } from '@/lib/api'
import { getHeads } from '@/lib/api'
import { useApiResource } from '@/hooks/useApiResource'
import { Card, ErrorNote } from '@/components/ui'
import type { HeadsResponse, PredictResponse } from '@/types/api'

export default function Home() {
  const [response, setResponse] = useState<PredictResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // The field list comes from the model itself, so a re-trained checkpoint
  // with different heads needs no frontend change.
  const heads = useApiResource<HeadsResponse>(({ signal }) => getHeads({ signal }))

  const handleSubmit = useCallback(async (smiles: string[]) => {
    setLoading(true)
    setError(null)
    try {
      setResponse(await predict(smiles))
    } catch (caught) {
      setResponse(null)
      setError(
        caught instanceof ApiError
          ? caught.message
          : 'The prediction request failed unexpectedly.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  const handleClear = useCallback(() => {
    setResponse(null)
    setError(null)
  }, [])

  return (
    <div className="min-h-screen">
      <header
        className="border-b"
        style={{ background: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Logo />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              MolFECAM
            </span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <ApiStatus />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="max-w-2xl">
          <h1
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
            style={{ color: 'var(--text-primary)' }}
          >
            Molecular property prediction
          </h1>
          <p className="mt-2 text-sm leading-6 sm:text-base" style={{ color: 'var(--text-secondary)' }}>
            Score molecules for clinical toxicity and FDA approval with a frozen
            MoLFormer encoder and an EWC-regularised classifier trained
            incrementally across eight datasets.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <InputForm
              onSubmit={handleSubmit}
              onClear={handleClear}
              loading={loading}
              hasResults={response !== null}
            />

            {error && <ErrorNote message={error} />}

            {response && heads.data && (
              <ResultsPanel response={response} heads={heads.data.heads} />
            )}

            {!response && !error && !loading && <EmptyState />}
          </div>

          <aside className="space-y-6">
            {heads.data && <HeadsReference heads={heads.data.heads} />}
            <AboutCard />
          </aside>
        </div>

        {/* Full width: the chart needs the room to stay legible. */}
        <div className="mt-6">
          <ForgettingMetrics />
        </div>

        <footer
          className="mt-12 border-t pt-6 text-xs"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
        >
          <p>
            Research prototype. Predictions come from a model trained on small,
            heavily imbalanced public datasets and are not a basis for any
            safety, clinical or regulatory decision.
          </p>
        </footer>
      </main>
    </div>
  )
}

function EmptyState() {
  return (
    <Card className="px-5 py-10 text-center">
      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
        No predictions yet
      </p>
      <p className="mx-auto mt-1.5 max-w-sm text-sm" style={{ color: 'var(--text-secondary)' }}>
        Paste SMILES strings above, or add one of the example molecules, then
        press Predict.
      </p>
    </Card>
  )
}

function HeadsReference({ heads }: { heads: { key: string; label: string; description: string; classes: string[] }[] }) {
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
        What the model predicts
      </h2>
      <dl className="mt-3 space-y-3.5">
        {heads.map((head) => (
          <div key={head.key}>
            <dt className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {head.label}
            </dt>
            <dd className="mt-0.5 text-xs leading-5" style={{ color: 'var(--text-secondary)' }}>
              {head.description}
              <br />
              <span style={{ color: 'var(--text-muted)' }}>
                Classes: {head.classes.join(' · ')}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}

function AboutCard() {
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
        How it works
      </h2>
      <ol
        className="mt-3 space-y-2.5 text-xs leading-5"
        style={{ color: 'var(--text-secondary)' }}
      >
        <li>
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
            1. Encode.
          </span>{' '}
          Each SMILES goes through a frozen MoLFormer-XL encoder, which returns a
          768-dimensional embedding.
        </li>
        <li>
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
            2. Classify.
          </span>{' '}
          A small MLP head maps that embedding to one prediction per property.
        </li>
        <li>
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
            3. Retain.
          </span>{' '}
          The head is trained across datasets in sequence, with an EWC penalty
          that discourages it from overwriting what earlier tasks taught it.
        </li>
      </ol>
    </Card>
  )
}

function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 4.5v5M12 14.5v5M7.2 7.2l3.5 3.5M13.3 13.3l3.5 3.5M16.8 7.2l-3.5 3.5M10.7 13.3l-3.5 3.5"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2.4" fill="var(--accent)" />
      <circle cx="12" cy="3.6" r="1.7" fill="var(--accent)" opacity="0.65" />
      <circle cx="12" cy="20.4" r="1.7" fill="var(--accent)" opacity="0.65" />
      <circle cx="5.9" cy="18.1" r="1.7" fill="var(--accent)" opacity="0.65" />
      <circle cx="18.1" cy="18.1" r="1.7" fill="var(--accent)" opacity="0.65" />
      <circle cx="5.9" cy="5.9" r="1.7" fill="var(--accent)" opacity="0.65" />
      <circle cx="18.1" cy="5.9" r="1.7" fill="var(--accent)" opacity="0.65" />
    </svg>
  )
}
