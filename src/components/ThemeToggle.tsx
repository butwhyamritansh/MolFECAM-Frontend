'use client'

import { useEffect, useState } from 'react'

import { clearSetting, readSetting, writeSetting } from '@/lib/storage'

type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'molfecam-theme'

function apply(theme: Theme): void {
  const root = document.documentElement
  if (theme === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', theme)
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = readSetting(STORAGE_KEY) as Theme | null
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored)
      apply(stored)
    }
    setMounted(true)
  }, [])

  const choose = (next: Theme) => {
    setTheme(next)
    apply(next)
    if (next === 'system') clearSetting(STORAGE_KEY)
    else writeSetting(STORAGE_KEY, next)
  }

  // Render a stable placeholder until mounted so SSR and client markup match.
  if (!mounted) return <div className="h-8 w-[104px]" aria-hidden="true" />

  const options: { value: Theme; label: string; icon: string }[] = [
    { value: 'light', label: 'Light theme', icon: '☀' },
    { value: 'system', label: 'System theme', icon: '◐' },
    { value: 'dark', label: 'Dark theme', icon: '☾' },
  ]

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      style={{ background: 'var(--surface-2)', borderColor: 'var(--border-subtle)' }}
      className="inline-flex rounded-lg border p-0.5"
    >
      {options.map((option) => {
        const active = theme === option.value
        return (
          <button
            key={option.value}
            role="radio"
            aria-checked={active}
            aria-label={option.label}
            title={option.label}
            onClick={() => choose(option.value)}
            style={{
              background: active ? 'var(--surface-1)' : 'transparent',
              color: active ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: active ? 'var(--shadow-card)' : 'none',
            }}
            className="rounded-md px-2.5 py-1 text-sm transition-colors"
          >
            {option.icon}
          </button>
        )
      })}
    </div>
  )
}
