'use client';

import ResultCard from './ResultCard';

interface Service {
  resource: string;
  description: string;
  cost?: string;
  network?: string;
  trust_score?: number;
  performance_score?: number;
  final_score?: number;
}

interface SearchResultsProps {
  services: Service[];
  totalFound: number;
  responseTime?: number;
  aiInsight?: string;
}

export default function SearchResults({
  services,
  totalFound,
  responseTime,
  aiInsight,
}: SearchResultsProps) {
  return (
    <div className="max-w-3xl">
      {/* AI Insight */}
      {aiInsight && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">AI Insight</h4>
              <p className="text-sm text-blue-800 leading-relaxed">{aiInsight}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results metadata */}
      <div className="text-sm text-gray-600 mb-6">
        About {totalFound.toLocaleString()} results
        {responseTime && <span className="ml-1">({(responseTime / 1000).toFixed(2)} seconds)</span>}
      </div>

      {/* Results list */}
      <div>
        {services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No results found. Try a different search query.</p>
          </div>
        ) : (
          services.map((service, index) => (
            <ResultCard
              key={`${service.resource}-${index}`}
              resource={service.resource}
              description={service.description}
              cost={service.cost}
              network={service.network}
              trustScore={service.trust_score}
              performanceScore={service.performance_score}
              finalScore={service.final_score}
              fullData={service}
            />
          ))
        )}
      </div>
    </div>
  );
}
