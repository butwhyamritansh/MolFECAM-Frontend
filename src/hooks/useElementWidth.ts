'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Track an element's content width.
 *
 * An SVG with a fixed `viewBox` scales its text along with its geometry, so a
 * 720-unit chart squeezed into a 300px column renders 11px labels at ~5px.
 * Measuring the container lets the chart pick a viewBox close to its rendered
 * size, keeping text at its nominal size on every breakpoint.
 */
export function useElementWidth<T extends HTMLElement>(fallback = 720) {
  const ref = useRef<T | null>(null)
  const [width, setWidth] = useState(fallback)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new ResizeObserver(([entry]) => {
      const next = entry.contentRect.width
      if (next > 0) setWidth(next)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return { ref, width }
}
