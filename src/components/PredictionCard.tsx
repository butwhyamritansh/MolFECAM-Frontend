'use client'

import React from 'react'
import { PredictionResult } from '@/types/prediction'

interface PredictionCardProps {
  result: PredictionResult
  fields: string[]
}

const headKeyMap: Record<string,string> = {
  'Label':        'predicted_label',
  'FDA Approved': 'predicted_fda',
  'Taste':        'predicted_taste',
  'Tox21 ID':     'predicted_tox21_id',
}

const confKeyMap: Record<string,string> = {
  'Label':        'confidence_label',
  'FDA Approved': 'confidence_fda',
  'Taste':        'confidence_taste',
  'Tox21 ID':     'confidence_tox21_id',
}

export default function PredictionCard({ result, fields }: PredictionCardProps) {
  if (!fields.length) return null

  return (
    <div className="mt-4 p-4 bg-white shadow rounded text-left">
      {fields.map(field => {
        const pk = headKeyMap[field]
        const ck = confKeyMap[field]
        const v  = result[pk]
        const c  = result[ck]
        if (v == null) return null

        return (
          <div key={field} className="flex justify-between py-1 border-b last:border-0">
            <span className="font-medium text-gray-800">{field}:</span>
            <span className="text-gray-600">
              {v}{' '}
              <small className="text-sm text-gray-500">(conf: {c})</small>
            </span>
          </div>
        )
      })}
    </div>
  )
}