'use client';

import { memo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ResultCardProps {
  resource: string;
  description: string;
  network: string;
  asset: string;
  max_amount?: number;
  similarity?: number;
  finalScore?: number;
  fullData?: any; // Complete service data from API
}

function ResultCard({
  resource,
  description,
  network,
  max_amount,
  similarity,
  finalScore,
  fullData,
}: ResultCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleViewDetails = () => {
    // Create URL-safe service ID (computed only on click)
    const serviceId = btoa(resource).replace(/[/+=]/g, '-');

    // Store complete service data in sessionStorage (lazy loading - only on click)
    if (fullData) {
      sessionStorage.setItem(`service-${serviceId}`, JSON.stringify(fullData));
    }

    // Navigate with search context
    const query = searchParams.get('q');
    const url = query
      ? `/service/${serviceId}?from=search&q=${encodeURIComponent(query)}`
      : `/service/${serviceId}`;

    router.push(url);
  };

  // Extract domain from resource URL
  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  // Format maxAmount from micro-USDC (6 decimals) to decimal
  const formatAmount = (amount?: number | string) => {
    if (!amount) return 'N/A';
    try {
      const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;
      const decimal = amountNum / 1e6; // USDC has 6 decimals
      // Remove trailing zeros by converting to number then back to string
      return parseFloat(decimal.toFixed(6)).toString() + ' USDC';
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="mb-6 sm:mb-7">
      {/* Resource URL */}
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <span className="text-sm text-green-700 break-all">{getDomain(resource)}</span>
        {network && (
          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded whitespace-nowrap">
            {network}
          </span>
        )}
      </div>

      {/* Title (clickable resource) */}
      <h3 className="text-lg sm:text-xl mb-1">
        <button
          onClick={handleViewDetails}
          className="text-blue-700 hover:underline visited:text-purple-700 text-left break-all"
        >
          {resource}
        </button>
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-700 mb-2 leading-relaxed">
        {description || 'No description available.'}
      </p>

      {/* Metadata badges */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-4 text-xs text-gray-600">
        {/* Cost per Request */}
        <div className="flex items-center gap-1 whitespace-nowrap">
          <span className="font-medium">Cost/Request:</span>
          <span>{formatAmount(max_amount)}</span>
        </div>

        {/* Similarity Score */}
        {similarity !== undefined && similarity > 0 && (
          <div className="flex items-center gap-1 whitespace-nowrap">
            <span className="font-medium">Match:</span>
            <span>{(similarity * 100).toFixed(0)}%</span>
          </div>
        )}

        {/* Final Score */}
        {finalScore !== undefined && finalScore > 0 && (
          <div className="flex items-center gap-1 whitespace-nowrap">
            <span className="font-medium">Score:</span>
            <span>{(finalScore * 100).toFixed(0)}%</span>
          </div>
        )}

        {/* Transaction Count if available in fullData */}
        {fullData?.trust_transaction_count !== undefined && fullData.trust_transaction_count > 0 && (
          <div className="flex items-center gap-1 whitespace-nowrap">
            <span className="font-medium">Transactions:</span>
            <span>{fullData.trust_transaction_count.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(ResultCard);
