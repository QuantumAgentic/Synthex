'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import SearchBar from '../../components/SearchBar';
import SearchResults from '../../components/SearchResults';

interface SearchResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  x402: {
    services: Array<{
      resource: string;
      description: string;
      cost?: string;
      network?: string;
      trust_score?: number;
      performance_score?: number;
      final_score?: number;
    }>;
    total_found: number;
    tier?: string;
    resultsLimit?: number;
    searchesRemaining?: number;
    dailyLimit?: number;
  };
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTime, setSearchTime] = useState<number>(0);

  useEffect(() => {
    if (!query) return;

    const performSearch = async () => {
      setLoading(true);
      setError(null);
      const startTime = Date.now();

      try {
        // Call the hidden free endpoint
        const response = await fetch(
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/search/free',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
          }
        );

        const endTime = Date.now();
        setSearchTime(endTime - startTime);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Search failed');
        }

        const data = await response.json();
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  // Extract AI insight from the response
  const aiInsight = results?.choices?.[0]?.message?.content;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header with compact search */}
      <Header compact />

      {/* Search bar below header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <SearchBar initialQuery={query} size="compact" />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Free tier banner */}
        {results?.x402?.tier === 'free' && results?.x402?.searchesRemaining !== undefined && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-blue-900">Free Search</h4>
                <p className="text-sm text-blue-700 mt-1">
                  {results.x402.searchesRemaining} of {results.x402.dailyLimit} free searches remaining today
                </p>
              </div>
              {results.x402.searchesRemaining === 0 && (
                <a
                  href="/docs"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 underline whitespace-nowrap"
                >
                  Upgrade to API
                </a>
              )}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Searching...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-900 font-semibold mb-2">Search Error</h3>
            <p className="text-red-700">{error}</p>
            {error.includes('Rate Limit') && (
              <a
                href="/docs"
                className="inline-block mt-4 text-sm font-medium text-red-600 hover:text-red-700 underline"
              >
                Learn about our API for unlimited searches
              </a>
            )}
          </div>
        )}

        {/* Results */}
        {!loading && !error && results && (
          <SearchResults
            services={results.x402.services}
            totalFound={results.x402.total_found}
            responseTime={searchTime}
            aiInsight={aiInsight}
          />
        )}

        {/* No query */}
        {!query && (
          <div className="text-center py-12">
            <p className="text-gray-600">Enter a search query to get started</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
