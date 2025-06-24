'use client'

import { useState } from 'react'
import { PredictionResult } from '@/types/prediction'

interface InputFormProps {
  setResult: (data: PredictionResult[]) => void
  setFields: (fields: string[]) => void
}

export default function InputForm({ setResult, setFields }: InputFormProps) {
  const [smiles, setSmiles] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const fieldOptions = ['Label', 'FDA Approved', 'Taste', 'Tox21 ID']
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smiles: [smiles],
          fields: selectedFields
        }),
      })
      if (!res.ok) throw new Error('Network response was not ok')
      const data = await res.json()
      setResult(data.results)
      setFields(selectedFields)
    } catch (err) {
      console.error('Prediction error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* use flex + wrap + gap for even horizontal/vertical spacing */}
      <div className="flex flex-wrap items-center gap-4 text-black">
        {fieldOptions.map(field => (
          <label key={field} className="inline-flex items-center space-x-2 text-black">
            <input
              type="checkbox"
              value={field}
              checked={selectedFields.includes(field)}
              onChange={() =>
                setSelectedFields(prev =>
                  prev.includes(field)
                    ? prev.filter(f => f !== field)
                    : [...prev, field]
                )
              }
              // use Tailwind’s accent- utilities to color the checkbox itself
              className="form-checkbox accent-black"
            />
            <span>{field}</span>
          </label>
        ))}
      </div>
      <input
        type="text"
        value={smiles}
        onChange={e => setSmiles(e.target.value)}
        placeholder="Enter SMILES string"
        className="w-full text-black px-4 py-2 border rounded shadow-sm"
        required
      />
      <button
        type="submit"
        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? 'Predicting...' : 'Predict'}
      </button>
    </form>
  )
}

