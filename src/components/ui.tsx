'use client'

import React from 'react'

type Tone = 'neutral' | 'good' | 'warning' | 'critical' | 'accent'

const TONE_STYLE: Record<Tone, React.CSSProperties> = {
  neutral: { background: 'var(--surface-2)', color: 'var(--text-secondary)' },
  good: { background: 'var(--status-good-soft)', color: 'var(--status-good)' },
  warning: { background: 'var(--status-warning-soft)', color: 'var(--status-warning)' },
  critical: { background: 'var(--status-critical-soft)', color: 'var(--status-critical)' },
  accent: { background: 'var(--accent-soft)', color: 'var(--accent)' },
}

export function Badge({
  tone = 'neutral',
  children,
  title,
}: {
  tone?: Tone
  children: React.ReactNode
  title?: string
}) {
  return (
    <span
      title={title}
      style={TONE_STYLE[tone]}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap"
    >
      {children}
    </span>
  )
}

export function Card({
  children,
  className = '',
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      style={{
        background: 'var(--surface-1)',
        borderColor: 'var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
      }}
      className={`rounded-xl border ${className}`}
    >
      {children}
    </div>
  )
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({
  variant = 'secondary',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const style: React.CSSProperties =
    variant === 'primary'
      ? { background: 'var(--accent)', color: 'var(--accent-ink)', borderColor: 'transparent' }
      : variant === 'secondary'
        ? {
            background: 'var(--surface-1)',
            color: 'var(--text-primary)',
            borderColor: 'var(--border-strong)',
          }
        : { background: 'transparent', color: 'var(--text-secondary)', borderColor: 'transparent' }

  return (
    <button
      {...rest}
      style={style}
      className={
        'inline-flex items-center justify-center gap-2 rounded-lg border px-3.5 py-2 ' +
        'text-sm font-medium transition-opacity hover:opacity-85 ' +
        'disabled:cursor-not-allowed disabled:opacity-50 ' +
        className
      }
    >
      {children}
    </button>
  )
}

export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="animate-spin"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Inline error panel with an optional retry. */
export function ErrorNote({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div
      role="alert"
      style={{
        background: 'var(--status-critical-soft)',
        borderColor: 'var(--status-critical)',
      }}
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3.5 py-3"
    >
      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} className="shrink-0">
          Try again
        </Button>
      )}
    </div>
  )
}
