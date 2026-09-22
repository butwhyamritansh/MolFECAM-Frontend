'use client'

import PredictionCard from '@/components/PredictionCard'
import { downloadCsv, downloadJson } from '@/lib/export'
import { Badge, Button, Card, SectionHeading } from '@/components/ui'
import type { HeadInfo, PredictResponse } from '@/types/api'

interface ResultsPanelProps {
  response: PredictResponse
  heads: HeadInfo[]
}

export default function ResultsPanel({ response, heads }: ResultsPanelProps) {
  const { results, scored, rejected, demo } = response

  return (
    <section className="space-y-3" aria-live="polite">
      <Card className="px-5 py-4">
        <SectionHeading
          title="Results"
          description={
            rejected > 0
              ? `${scored} scored, ${rejected} rejected.`
              : `${scored} ${scored === 1 ? 'molecule' : 'molecules'} scored.`
          }
          action={
            <div className="flex items-center gap-2">
              {demo && <Badge tone="warning">Demo data</Badge>}
              <Button onClick={() => downloadCsv(results, heads)}>CSV</Button>
              <Button onClick={() => downloadJson(results)}>JSON</Button>
            </div>
          }
        />
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {results.map((result, index) => (
          <PredictionCard
            key={`${result.smiles}-${index}`}
            result={result}
            heads={heads}
            index={index}
          />
        ))}
      </div>
    </section>
  )
}
