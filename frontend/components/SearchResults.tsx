'use client';

import ResultCard from './ResultCard';

interface Service {
  id: number;
  resource: string;
  description: string;
  network: string;
  asset: string;
  max_amount: number;
  similarity_score?: number;
  final_score?: number;
  score_confidence?: number;
  trust_transaction_count?: number;
}

interface SearchResultsProps {
  services: Service[];
  totalFound: number;
  responseTime?: number;
}

export default function SearchResults({
  services,
  totalFound,
  responseTime,
}: SearchResultsProps) {
  return (
    <div className="w-full max-w-3xl">

      {/* Results metadata */}
      <div className="text-sm text-gray-600 mb-4 sm:mb-6">
        About {totalFound.toLocaleString()} results
        {responseTime && <span className="ml-1 hidden sm:inline">({(responseTime / 1000).toFixed(2)} seconds)</span>}
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
              network={service.network}
              asset={service.asset}
              max_amount={service.max_amount}
              similarity={service.similarity_score}
              finalScore={service.final_score}
              fullData={service}
            />
          ))
        )}
      </div>
    </div>
  );
}
