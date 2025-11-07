'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BackButton } from '@/components/service/BackButton';
import { EndpointTester } from '@/components/service/EndpointTester';

interface ServiceData {
  id: number;
  resource: string;
  description: string;
  network: string;
  asset: string;
  max_amount: number;
  pay_to: string;
  manifest: any;
  similarity_score?: number;
  final_score?: number;
  trust_transaction_count?: number;
}

function ServiceDetailsContent({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const [serviceData, setServiceData] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retrieve service data from sessionStorage
    const stored = sessionStorage.getItem(`service-${params.id}`);

    if (stored) {
      try {
        const data = JSON.parse(stored);
        setServiceData(data);
      } catch (err) {
        console.error('Failed to parse service data:', err);
      }
    }

    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-x402-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!serviceData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Service Not Found</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Could not load service details. Please return to search and try again.
          </p>
          <a
            href="/search"
            className="inline-block px-6 py-2 bg-x402-primary text-white rounded-lg hover:bg-x402-secondary transition-colors"
          >
            Back to Search
          </a>
        </div>
      </div>
    );
  }

  const query = searchParams.get('q');

  // Format maxAmount from micro-USDC (6 decimals) to decimal
  const formatCost = (amount?: number | string) => {
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

  // Extract data from manifest.accepts[0] if available
  const primaryAccept = serviceData.manifest?.accepts?.[0];

  // Create accept object for EndpointTester
  const mockAccept = {
    mimeType: primaryAccept?.mimeType || 'application/json',
    resource: serviceData.resource,
    asset: serviceData.asset || '',
    description: serviceData.description || '',
    scheme: 'x402',
    network: serviceData.network || 'base',
    outputSchema: primaryAccept?.outputSchema || {
      input: {
        method: 'POST' as const,
        type: 'http' as const,
        discoverable: true
      },
      output: {}
    },
    maxAmount: serviceData.max_amount?.toString() || '0',
    payTo: serviceData.pay_to || '',
    maxAmountRequired: serviceData.max_amount?.toString() || '0',
    maxTimeoutSeconds: primaryAccept?.maxTimeoutSeconds || 30
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <BackButton query={query} />

        {/* Service Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 break-all">{serviceData.resource}</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4">{serviceData.description || 'No description available'}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <span className="text-sm text-gray-500">Network:</span>
              <p className="font-medium">{serviceData.network || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Cost per Request:</span>
              <p className="font-medium">{formatCost(serviceData.max_amount)}</p>
            </div>

            {/* Similarity score if available */}
            {serviceData.similarity_score !== undefined && (
              <div>
                <span className="text-sm text-gray-500">Similarity Match:</span>
                <p className="font-medium">{(serviceData.similarity_score * 100).toFixed(0)}%</p>
              </div>
            )}

            {/* Final score if available */}
            {serviceData.final_score !== undefined && (
              <div>
                <span className="text-sm text-gray-500">Overall Score:</span>
                <p className="font-medium">{(serviceData.final_score * 100).toFixed(0)}%</p>
              </div>
            )}

            {/* Technical details */}
            {serviceData.asset && (
              <div className="col-span-1 sm:col-span-2">
                <span className="text-sm text-gray-500">Asset Address:</span>
                <p className="font-medium text-xs break-all font-mono overflow-x-auto">{serviceData.asset}</p>
              </div>
            )}
            {serviceData.pay_to && (
              <div className="col-span-1 sm:col-span-2">
                <span className="text-sm text-gray-500">Payment Address:</span>
                <p className="font-medium text-xs break-all font-mono overflow-x-auto">{serviceData.pay_to}</p>
              </div>
            )}
          </div>
        </div>

        {/* Endpoint Tester */}
        <EndpointTester
          accept={mockAccept}
          inputSchema={null}
          outputSchema={null}
          expectedMimeType="application/json"
        />
      </div>
    </div>
  );
}

export default function ServiceDetailsPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-x402-primary"></div>
      </div>
    }>
      <ServiceDetailsContent params={params} />
    </Suspense>
  );
}

// Note: generateStaticParams() cannot be used with 'use client' directive
// This page relies on client-side sessionStorage, so it's fully dynamic
export const dynamicParams = true;
