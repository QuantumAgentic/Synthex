'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  initialQuery?: string;
  size?: 'large' | 'compact';
  autoFocus?: boolean;
}

export default function SearchBar({ initialQuery = '', size = 'large', autoFocus = false }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const heightClass = size === 'large' ? 'h-14' : 'h-11';
  const textClass = size === 'large' ? 'text-base' : 'text-sm';
  const paddingClass = size === 'large' ? 'px-5' : 'px-4';

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="relative flex items-center">
        {/* Search Icon */}
        <div className="absolute left-4 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search x402 services..."
          autoFocus={autoFocus}
          className={`
            w-full ${heightClass} ${textClass} ${paddingClass}
            pl-12 pr-4
            border border-gray-300 rounded-full
            shadow-sm hover:shadow-md focus:shadow-md
            transition-shadow duration-200
            focus:outline-none focus:border-blue-500
            text-gray-900 placeholder-gray-500
          `}
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-16 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Search Button (Mobile) */}
        <button
          type="submit"
          className="absolute right-3 text-blue-600 hover:text-blue-700 transition-colors"
          aria-label="Search"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </button>
      </div>

      {/* Buttons (only on large/homepage) */}
      {size === 'large' && (
        <div className="flex justify-center gap-3 mt-8">
          <button
            type="submit"
            className="px-6 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded text-sm text-gray-700 transition-colors"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              if (query.trim()) {
                router.push(`/search?q=${encodeURIComponent(query.trim())}&lucky=true`);
              }
            }}
            className="px-6 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded text-sm text-gray-700 transition-colors"
          >
            I'm Feeling Lucky
          </button>
        </div>
      )}
    </form>
  );
}
