'use client'

import { useMemo, useRef, useState } from 'react'

import { EXAMPLE_MOLECULES, SAMPLE_BATCH } from '@/lib/molecules'
import { dedupe, parseInput, quickValidate } from '@/lib/smiles'
import { Button, Card, Spinner } from '@/components/ui'

const MAX_BATCH = 64

interface InputFormProps {
  onSubmit: (smiles: string[]) => void
  onClear: () => void
  loading: boolean
  hasResults: boolean
}

/**
 * Batch SMILES editor.
 *
 * The backend has always accepted a list; the old form sent `[smiles]` from a
 * single-line input, so batch capacity was unreachable from the UI.
 */
export default function InputForm({
  onSubmit,
  onClear,
  loading,
  hasResults,
}: InputFormProps) {
  const [raw, setRaw] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const entries = useMemo(() => dedupe(parseInput(raw)), [raw])
  const problems = useMemo(
    () =>
      entries
        .map((entry) => ({ ...entry, problem: quickValidate(entry.smiles) }))
        .filter((entry): entry is typeof entry & { problem: string } => entry.problem !== null),
    [entries],
  )

  const duplicates = parseInput(raw).length - entries.length
  const overLimit = entries.length > MAX_BATCH
  const canSubmit = entries.length > 0 && !overLimit && !loading

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit(entries.map((entry) => entry.smiles))
  }

  const appendExample = (smiles: string) => {
    setRaw((current) => {
      const trimmed = current.trimEnd()
      return trimmed ? `${trimmed}\n${smiles}` : smiles
    })
    textareaRef.current?.focus()
  }

  return (
    <Card className="p-5 sm:p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="smiles-input"
            className="block text-sm font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            SMILES input
          </label>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            One molecule per line. Commas, spaces and tabs also separate entries, and{' '}
            <code className="font-mono text-[0.8em]">#</code> starts a comment.
          </p>
        </div>

        <textarea
          id="smiles-input"
          ref={textareaRef}
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          onKeyDown={(event) => {
            // Submitting from a textarea needs an explicit shortcut.
            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') handleSubmit(event)
          }}
          rows={6}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          placeholder={'CC(=O)Oc1ccccc1C(=O)O\nCn1cnc2c1c(=O)n(C)c(=O)n2C'}
          aria-describedby="smiles-help"
          style={{
            background: 'var(--surface-inset)',
            borderColor: overLimit ? 'var(--status-critical)' : 'var(--border-strong)',
            color: 'var(--text-primary)',
          }}
          className="w-full resize-y rounded-lg border px-3.5 py-3 font-mono text-sm leading-6"
        />

        <div
          id="smiles-help"
          className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          <span aria-live="polite">
            {entries.length} {entries.length === 1 ? 'molecule' : 'molecules'}
            {overLimit && ` — over the limit of ${MAX_BATCH}`}
          </span>
          {duplicates > 0 && <span>{duplicates} duplicate removed</span>}
          <span className="ml-auto">⌘/Ctrl + Enter to predict</span>
        </div>

        {problems.length > 0 && (
          <ul
            className="space-y-1 rounded-lg border px-3.5 py-3 text-xs"
            style={{
              background: 'var(--status-warning-soft)',
              borderColor: 'var(--status-warning)',
              color: 'var(--text-primary)',
            }}
          >
            {problems.slice(0, 4).map((problem) => (
              <li key={`${problem.line}-${problem.smiles}`}>
                <span className="font-mono">{problem.smiles.slice(0, 30)}</span> — {problem.problem}
              </li>
            ))}
            {problems.length > 4 && <li>…and {problems.length - 4} more.</li>}
            <li className="pt-1" style={{ color: 'var(--text-secondary)' }}>
              These are sent anyway — the server validates with RDKit and reports each row.
            </li>
          </ul>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" variant="primary" disabled={!canSubmit}>
            {loading ? (
              <>
                <Spinner /> Predicting…
              </>
            ) : (
              <>Predict {entries.length > 1 && `(${entries.length})`}</>
            )}
          </Button>
          <Button type="button" onClick={() => setRaw(SAMPLE_BATCH)} disabled={loading}>
            Load sample batch
          </Button>
          {(raw || hasResults) && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setRaw('')
                onClear()
              }}
              disabled={loading}
            >
              Clear
            </Button>
          )}
        </div>
      </form>

      <div className="mt-5 border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }}>
        <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          Add an example
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {EXAMPLE_MOLECULES.map((molecule) => (
            <button
              key={molecule.name}
              type="button"
              onClick={() => appendExample(molecule.smiles)}
              title={`${molecule.note} — ${molecule.smiles}`}
              style={{
                background: 'var(--surface-2)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
              className="rounded-full border px-2.5 py-1 text-xs transition-opacity hover:opacity-75"
            >
              + {molecule.name}
            </button>
          ))}
        </div>
      </div>
    </Card>
  )
}
