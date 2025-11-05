'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface ResultCardProps {
  resource: string;
  description: string;
  cost?: string;
  network?: string;
  trustScore?: number;
  performanceScore?: number;
  finalScore?: number;
  fullData?: any; // Complete service data from API
}

export default function ResultCard({
  resource,
  description,
  cost,
  network,
  trustScore,
  performanceScore,
  finalScore,
  fullData,
}: ResultCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleViewDetails = () => {
    // Create URL-safe service ID
    const serviceId = btoa(resource).replace(/[/+=]/g, '-');

    // Store complete service data in sessionStorage
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

  // Format cost for display
  const formatCost = (costStr?: string) => {
    if (!costStr) return 'Free';
    const cost = parseFloat(costStr);
    if (cost === 0) return 'Free';
    return `$${(cost / 1e18).toFixed(6)}`;
  };

  // Score color based on value
  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-blue-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="mb-7">
      {/* Resource URL */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm text-green-700">{getDomain(resource)}</span>
        {network && (
          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
            {network}
          </span>
        )}
      </div>

      {/* Title (clickable resource) */}
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-xl flex-1">
          <button
            onClick={handleViewDetails}
            className="text-blue-700 hover:underline visited:text-purple-700 text-left"
          >
            {resource}
          </button>
        </h3>
        {fullData && (
          <button
            onClick={handleViewDetails}
            className="px-3 py-1 text-sm bg-x402-primary text-white rounded hover:bg-x402-secondary transition-colors"
          >
            Test
          </button>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 mb-2 leading-relaxed">
        {description || 'No description available.'}
      </p>

      {/* Metadata badges */}
      <div className="flex items-center gap-4 text-xs text-gray-600">
        {/* Cost */}
        <div className="flex items-center gap-1">
          <span className="font-medium">Cost:</span>
          <span>{formatCost(cost)}</span>
        </div>

        {/* Trust Score */}
        {trustScore !== undefined && (
          <div className="flex items-center gap-1">
            <span className="font-medium">Trust:</span>
            <span className={getScoreColor(trustScore)}>
              {(trustScore * 100).toFixed(0)}%
            </span>
          </div>
        )}

        {/* Performance Score */}
        {performanceScore !== undefined && (
          <div className="flex items-center gap-1">
            <span className="font-medium">Performance:</span>
            <span className={getScoreColor(performanceScore)}>
              {(performanceScore * 100).toFixed(0)}%
            </span>
          </div>
        )}

        {/* Final Score */}
        {finalScore !== undefined && (
          <div className="flex items-center gap-1">
            <span className="font-medium">Score:</span>
            <span className={`${getScoreColor(finalScore)} font-semibold`}>
              {(finalScore * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
