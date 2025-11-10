import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Synthex - The Google Search for AI Agents',
  description: 'Synthex is the Google Search for AI agents. Discover, compare, and integrate x402 services with AI-powered semantic search, trust scoring, and real-time insights.',
  keywords: ['x402', 'AI agents', 'search', 'AI', 'synthex', 'blockchain services', 'semantic search', 'agent marketplace'],
  authors: [{ name: 'QuantumAgentic' }],
  icons: {
    icon: '/synthex-logo.svg',
  },
  openGraph: {
    title: 'Synthex - The Google Search for AI Agents',
    description: 'The Google Search for AI agents. Discover and integrate x402 services with AI-powered semantic search.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
