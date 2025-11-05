'use client';

import { ServiceData, X402Accept } from '@/types/service';
import { formatAmount } from '@/lib/x402-payment';

interface ServiceHeaderProps {
  service: ServiceData;
  accept: X402Accept;
  expectedResponseType: string;
}

export function ServiceHeader({ service, accept, expectedResponseType }: ServiceHeaderProps) {
  const { display } = formatAmount(accept.maxAmountRequired, accept.asset, accept.network);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {service.resource}
          </h1>
          <p className="text-gray-600">{service.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span data-testid="network-badge" className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {accept.network}
        </span>
        <span data-testid="cost-badge" className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          {display} per call
        </span>
        <span data-testid="response-type-badge" className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
          {expectedResponseType}
        </span>
        {service.scores && (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            Score: {(service.scores.final * 100).toFixed(0)}/100
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
        <div>
          <p className="text-sm text-gray-500">Trust Score</p>
          <p className="text-lg font-semibold text-gray-900">
            {service.trustMetrics?.transactionCount || 0} txs
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Sources</p>
          <p className="text-lg font-semibold text-gray-900">
            {[service.sources.bazaar && 'Bazaar', service.sources.x402scan && 'x402scan', service.sources.xgate && 'xGate'].filter(Boolean).join(', ') || 'Unknown'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Similarity</p>
          <p className="text-lg font-semibold text-gray-900">
            {(service.similarity * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}
