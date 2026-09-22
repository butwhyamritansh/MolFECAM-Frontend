/**
 * Feature-detected access to `localStorage`.
 *
 * `typeof localStorage !== 'undefined'` is not a safe guard: Node 25 exposes a
 * partial `localStorage` global (an object with no `getItem`), so a naive check
 * passes during SSR and then throws. Safari private mode and blocked site data
 * fail differently again. Everything here degrades to a no-op.
 */

function storage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null
    const candidate = window.localStorage
    if (typeof candidate?.getItem !== 'function') return null
    return candidate
  } catch {
    return null
  }
}

export function readSetting(key: string): string | null {
  try {
    return storage()?.getItem(key) ?? null
  } catch {
    return null
  }
}

export function writeSetting(key: string, value: string): void {
  try {
    storage()?.setItem(key, value)
  } catch {
    /* quota exceeded or storage blocked — the choice still applies this session */
  }
}

export function clearSetting(key: string): void {
  try {
    storage()?.removeItem(key)
  } catch {
    /* nothing to do */
  }
}
