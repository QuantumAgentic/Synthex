'use client';

import { BazaarMetadata } from '@/types/service';

interface ServiceMetricsProps {
  metadata?: BazaarMetadata;
}

export function ServiceMetrics({ metadata }: ServiceMetricsProps) {
  if (!metadata) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Service Metrics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metadata.paymentAnalytics && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Payment Analytics</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Transactions</span>
                <span className="font-medium">{metadata.paymentAnalytics.totalTransactions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unique Users</span>
                <span className="font-medium">{metadata.paymentAnalytics.totalUniqueUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Daily Txs</span>
                <span className="font-medium">{metadata.paymentAnalytics.averageDailyTransactions.toFixed(1)}</span>
              </div>
            </div>
          </div>
        )}

        {metadata.performance && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Performance</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Latency</span>
                <span className="font-medium">{metadata.performance.avgLatencyMs}ms</span>
              </div>
              {metadata.performance.minLatencyMs && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Min Latency</span>
                  <span className="font-medium">{metadata.performance.minLatencyMs}ms</span>
                </div>
              )}
              {metadata.performance.maxLatencyMs && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Latency</span>
                  <span className="font-medium">{metadata.performance.maxLatencyMs}ms</span>
                </div>
              )}
            </div>
          </div>
        )}

        {metadata.reliability && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Reliability</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-medium">{(metadata.reliability.apiSuccessRate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Requests</span>
                <span className="font-medium">{metadata.reliability.totalRequests}</span>
              </div>
            </div>
          </div>
        )}

        {metadata.confidence && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Confidence Scores</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Overall</span>
                <span className="font-medium">{(metadata.confidence.overallScore * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Performance</span>
                <span className="font-medium">{(metadata.confidence.performanceScore * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reliability</span>
                <span className="font-medium">{(metadata.confidence.reliabilityScore * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
