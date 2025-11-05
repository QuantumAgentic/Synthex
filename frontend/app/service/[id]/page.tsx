'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ServiceData } from '@/types/service';
import { BackButton } from '@/components/service/BackButton';
import { ServiceHeader } from '@/components/service/ServiceHeader';
import { ServiceMetrics } from '@/components/service/ServiceMetrics';
import { EndpointTester } from '@/components/service/EndpointTester';

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
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h1>
          <p className="text-gray-600 mb-4">
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
  const accept = serviceData.manifest.accepts[0];
  const inputSchema = accept.outputSchema?.input || null;
  const outputSchema = accept.outputSchema?.output || null;
  const expectedMimeType = accept.mimeType || 'application/json';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <BackButton query={query} />

        <ServiceHeader
          service={serviceData}
          accept={accept}
          expectedResponseType={expectedMimeType}
        />

        <ServiceMetrics metadata={serviceData.manifest.metadata} />

        <EndpointTester
          accept={accept}
          inputSchema={inputSchema}
          outputSchema={outputSchema}
          expectedMimeType={expectedMimeType}
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
