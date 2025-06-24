'use client'

import { useState } from 'react'
import InputForm from '@/components/InputForm'
import PredictionCard from '@/components/PredictionCard'
import { PredictionResult } from '@/types/prediction'
import ForgettingMetrics from '@/components/ForgettingMetrics'

export default function Home() {
  const [result,    setResult]    = useState<PredictionResult[] | null>(null)
  const [fields,    setFields]    = useState<string[]>([])

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Molecular Property Prediction
        </h1>
        <p className="text-gray-600 mb-8">
          Enter a SMILES string to predict molecular properties like toxicity, sweetness, and more.
        </p>
        <InputForm
          setResult={setResult}
          setFields={setFields}
        />
        <ForgettingMetrics />
        {result?.map((item, i) => (
          <PredictionCard
            key={i}
            result={item}
            fields={fields}
          />
        ))}
      </div>
    </main>
  )
}