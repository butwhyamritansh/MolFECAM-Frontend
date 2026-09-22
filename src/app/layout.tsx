import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MolFECAM — Molecular property prediction',
  description:
    'Predict clinical toxicity and FDA approval for molecules from SMILES, using a ' +
    'frozen MoLFormer encoder with an EWC-regularised incremental classifier.',
  applicationName: 'MolFECAM',
  keywords: ['SMILES', 'molecular property prediction', 'MoLFormer', 'continual learning', 'EWC'],
  openGraph: {
    title: 'MolFECAM — Molecular property prediction',
    description: 'Score molecules for clinical toxicity and FDA approval from SMILES.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f7f5' },
    { media: '(prefers-color-scheme: dark)', color: '#121211' },
  ],
}

/**
 * Applies the stored theme before first paint.
 *
 * Without this the page renders in the system theme and then flips, which is
 * the classic dark-mode flash.
 */
const THEME_SCRIPT = `
(function () { try {
  var s = window.localStorage;
  if (!s || typeof s.getItem !== 'function') return;
  var t = s.getItem('molfecam-theme');
  if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
} catch (e) {} })();
`

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
