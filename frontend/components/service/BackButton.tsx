'use client';

import Link from 'next/link';

interface BackButtonProps {
  query?: string | null;
}

export function BackButton({ query }: BackButtonProps) {
  if (!query) {
    return null;
  }

  return (
    <Link
      href={`/search?q=${encodeURIComponent(query)}`}
      className="inline-flex items-center gap-2 text-x402-primary hover:text-x402-secondary transition-colors mb-6"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      <span>Back to Results</span>
    </Link>
  );
}
