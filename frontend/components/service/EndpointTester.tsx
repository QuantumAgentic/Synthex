'use client';

import { useState } from 'react';
import { X402Accept, X402Schema, TestResponse } from '@/types/service';
import { MultiChainConnect } from '../wallet/MultiChainConnect';
import { DynamicSchemaForm } from './DynamicSchemaForm';
import { ResponseViewer } from './ResponseViewer';
import { formatAmount } from '@/lib/x402-payment';
import { parseInputSchema } from '@/lib/schema-utils';
import { mockTestEndpoint } from '@/lib/x402-client';

interface EndpointTesterProps {
  accept: X402Accept;
  inputSchema: X402Schema['input'] | null;
  outputSchema: any | null;
  expectedMimeType: string;
}

export function EndpointTester({ accept, inputSchema, outputSchema, expectedMimeType }: EndpointTesterProps) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<TestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { display } = formatAmount(accept.maxAmountRequired, accept.asset, accept.network);
  const parsedSchema = inputSchema ? parseInputSchema(inputSchema) : null;

  const handleTest = async (inputData: Record<string, any>) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // TODO: Replace with real wallet transaction
      // For now, using mock test
      const result = await mockTestEndpoint({
        accept,
        inputData,
        inputSchema,
        outputSchema
      });

      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Test Endpoint</h2>

      {/* Step 1: Wallet Connection */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">1. Connect Wallet</h3>
        <MultiChainConnect network={accept.network} />
        <p className="mt-2 text-sm text-yellow-600">
          ⚠️ Demo mode: Using mock transactions (no real payment required)
        </p>
      </div>

      {/* Step 2: Payment Info */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">2. Payment Information</h3>
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Cost per Call</p>
            <p className="text-lg font-bold text-gray-900">{display}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Pay To</p>
            <p className="text-sm font-mono text-gray-900 truncate">{accept.payTo}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Network</p>
            <p className="text-sm font-medium text-gray-900">{accept.network}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Expected Response</p>
            <p className="text-sm font-medium text-gray-900">{expectedMimeType}</p>
          </div>
        </div>
      </div>

      {/* Step 3: Input Parameters */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">3. Input Parameters</h3>

        {parsedSchema && parsedSchema.hasParams ? (
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Method: <code className="bg-gray-100 px-2 py-1 rounded">{parsedSchema.method}</code>
            </p>
            <DynamicSchemaForm
              fields={parsedSchema.fields}
              onSubmit={handleTest}
              disabled={loading}
            />
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-3">
              This endpoint doesn't require input parameters
            </p>
            <button
              onClick={() => handleTest({})}
              disabled={loading}
              className="w-full px-4 py-2 bg-x402-primary text-white rounded-lg hover:bg-x402-secondary transition-colors disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Endpoint'}
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <div className="flex-1">
              <p className="font-medium text-blue-900">Testing endpoint...</p>
              <p className="text-sm text-blue-700">
                Validating input → Sending payment → Calling endpoint → Validating response
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg">
          <p className="font-medium text-red-900">Test Failed</p>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Response */}
      {response && (
        <ResponseViewer response={response} outputSchema={outputSchema} />
      )}
    </div>
  );
}
