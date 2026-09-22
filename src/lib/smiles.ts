/**
 * Client-side SMILES handling.
 *
 * This is a fast pre-flight check so obvious typos are caught before a network
 * round trip — it deliberately mirrors, but does not replace, the authoritative
 * RDKit validation in `backend/app/utils/smiles.py`.
 */

/** Characters that legitimately appear in a SMILES string. */
const ALLOWED = /^[A-Za-z0-9@+\-[\]()=#$:/\\.%*]+$/

const CLOSERS: Record<string, string> = { ')': '(', ']': '[' }
const OPENERS = new Set(Object.values(CLOSERS))

export interface ParsedLine {
  /** 1-based line number in the textarea, for error messages. */
  line: number
  smiles: string
}

/**
 * Split textarea content into SMILES entries.
 *
 * Accepts one-per-line, comma- or whitespace-separated, and ignores `#`
 * comments — so pasting from a CSV column or a paper's SI table just works.
 */
export function parseInput(raw: string): ParsedLine[] {
  const entries: ParsedLine[] = []
  raw.split(/\r?\n/).forEach((rawLine, index) => {
    const withoutComment = rawLine.split('#')[0]
    withoutComment
      .split(/[\s,;\t]+/)
      .map((token) => token.trim())
      .filter(Boolean)
      .forEach((smiles) => entries.push({ line: index + 1, smiles }))
  })
  return entries
}

export function bracketsBalanced(smiles: string): boolean {
  const stack: string[] = []
  for (const char of smiles) {
    if (OPENERS.has(char)) stack.push(char)
    else if (char in CLOSERS && stack.pop() !== CLOSERS[char]) return false
  }
  return stack.length === 0
}

/** Returns a human-readable problem, or `null` when the string looks plausible. */
export function quickValidate(smiles: string): string | null {
  const text = smiles.trim()
  if (!text) return 'Empty entry.'
  if (text.length > 1000) return 'Longer than 1000 characters.'
  if (!ALLOWED.test(text)) {
    const bad = [...new Set([...text].filter((c) => !ALLOWED.test(c)))]
    return `Invalid character${bad.length > 1 ? 's' : ''}: ${bad.join(' ')}`
  }
  if (!bracketsBalanced(text)) return 'Unbalanced parentheses or brackets.'
  return null
}

/** Remove duplicates while preserving first-seen order. */
export function dedupe(entries: ParsedLine[]): ParsedLine[] {
  const seen = new Set<string>()
  return entries.filter(({ smiles }) => {
    if (seen.has(smiles)) return false
    seen.add(smiles)
    return true
  })
}
