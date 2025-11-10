import { X402Accept, X402Schema, TestResponse } from '@/types/service';
import { parseResponse } from './response-handler';
import { validateInput, validateOutput } from './schema-utils';
import { buildQueryString } from './x402-payment';
import type { WalletClient } from 'viem';

export interface TestEndpointParams {
  accept: X402Accept;
  inputData: any;
  inputSchema: X402Schema['input'] | null;
  outputSchema: any | null;
  // Optional: walletClient for automatic payment handling (EVM)
  walletClient?: WalletClient;
  // Optional: solanaWallet for Solana network
  solanaWallet?: any;
}

/**
 * Test x402 endpoint with SDK-based payment handling
 *
 * Modes:
 * 1. With walletClient (Base/EVM): Direct call using x402-fetch SDK for automatic payments
 * 2. With solanaWallet (Solana): Uses wallet adapter for Solana payments
 * 3. Without wallet: Use backend proxy to avoid CORS issues
 *
 * The x402-fetch SDK automatically:
 * - Detects 402 Payment Required responses
 * - Creates and sends payment through PayAI facilitator
 * - Retries request with payment proof
 * - Returns final response
 *
 * Benefits:
 * - Gasless transactions (PayAI pays all gas fees)
 * - Payment verification by facilitator
 * - Proper settlement
 * - No CORS issues (via proxy when no wallet)
 */
export async function testX402Endpoint(
  params: TestEndpointParams
): Promise<TestResponse> {
  const startTime = Date.now();

  try {
    // 1. Validate input if schema present
    if (params.inputSchema && params.inputSchema.bodyFields) {
      const validation = validateInput(params.inputData, params.inputSchema);
      if (!validation.valid) {
        throw new Error(`Invalid input: ${validation.errors.map(e => e.message).join(', ')}`);
      }
    }

    // 2. Prepare request
    const method = params.inputSchema?.method || 'POST';
    const targetUrl = method === 'GET'
      ? `${params.accept.resource}?${buildQueryString(params.inputData)}`
      : params.accept.resource;

    const contentType = params.inputSchema?.bodyType === 'json'
      ? 'application/json'
      : (params.accept.mimeType || 'application/json');

    let response: Response;

    // 3. Create a custom fetch function that routes through our proxy
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const proxyUrl = `${backendUrl}/api/proxy`;

    // Custom fetch that proxies all requests through our backend to avoid CORS
    const proxyFetch = async (url: string, options?: RequestInit): Promise<Response> => {
      const proxyResponse = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          method: options?.method || 'GET',
          headers: options?.headers || {},
          body: options?.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : undefined
        })
      });

      // Always try to parse the proxy response (it returns 200 with real status in body)
      const proxyData = await proxyResponse.json();

      // Check if there was a proxy-level error (not a 402 from the endpoint)
      if (!proxyResponse.ok || proxyData.error) {
        throw new Error(proxyData.error || 'Proxy request failed');
      }

      // Create a Response-like object from proxy data
      return new Response(
        typeof proxyData.data === 'string' ? proxyData.data : JSON.stringify(proxyData.data),
        {
          status: proxyData.status,
          statusText: proxyData.statusText || '',
          headers: new Headers(proxyData.headers || {})
        }
      );
    };

    // 4. Use x402-fetch with wallet (if provided) but route through proxy
    if (params.walletClient) {
      // Use x402-fetch SDK with custom proxy fetch to avoid CORS
      const { wrapFetchWithPayment } = await import('x402-fetch');
      const fetchFn = wrapFetchWithPayment(proxyFetch as any, params.walletClient as any);

      response = await fetchFn(targetUrl, {
        method,
        headers: {
          'Content-Type': contentType,
        },
        body: method === 'POST' ? JSON.stringify(params.inputData) : undefined
      });
    } else if (params.solanaWallet) {
      // TODO: Implement Solana payment with x402-solana when package is available
      // For now, just use proxy without payment (will get 402 error)
      console.warn('Solana payments not yet implemented - endpoint may return 402');
      response = await proxyFetch(targetUrl, {
        method,
        headers: {
          'Content-Type': contentType,
        },
        body: method === 'POST' ? JSON.stringify(params.inputData) : undefined
      });
    } else {
      // No wallet - just use proxy fetch directly
      response = await proxyFetch(targetUrl, {
        method,
        headers: {
          'Content-Type': contentType,
        },
        body: method === 'POST' ? JSON.stringify(params.inputData) : undefined
      });
    }

    // 5. Parse response based on Content-Type
    const parsed = await parseResponse(response);

    // 6. Validate output if JSON and schema present
    let schemaValid = true;
    let schemaErrors: any[] = [];

    if (parsed.type === 'json' && params.outputSchema) {
      const validation = validateOutput(parsed.data, params.outputSchema);
      schemaValid = validation.valid;
      schemaErrors = validation.errors;
    }

    // 7. Extract payment info from response headers (if available)
    const paymentResponseHeader = response.headers.get('x-payment-response');
    let paymentInfo: any = null;

    if (paymentResponseHeader && params.walletClient) {
      try {
        const { decodeXPaymentResponse } = await import('x402-fetch');
        paymentInfo = decodeXPaymentResponse(paymentResponseHeader);
      } catch (e) {
        console.warn('Could not decode payment response:', e);
      }
    }

    // 8. Build response
    return {
      success: response.ok,
      status: response.status,
      contentType: parsed.contentType || '',
      responseType: parsed.type,
      data: parsed.data,
      blob: parsed.blob,
      text: parsed.text,
      url: parsed.url,
      schemaValid,
      schemaErrors,
      txHash: paymentInfo?.transactionHash || (params.walletClient ? 'sdk-handled' : 'no-payment'),
      paymentInfo, // Include full payment info
      time: Date.now() - startTime
    };
  } catch (error) {
    console.error('Error testing x402 endpoint:', error);
    throw error;
  }
}

/**
 * Mock test for development (no actual payment)
 *
 * This bypasses payment and calls the endpoint directly.
 * Useful for:
 * - Testing endpoints that don't require payment
 * - Development without wallet connection
 * - Testing response parsing and validation
 *
 * ⚠️ Most x402 endpoints will return 402 Payment Required when called this way.
 */
export async function mockTestEndpoint(
  params: Omit<TestEndpointParams, 'walletClient' | 'solanaWallet'>
): Promise<TestResponse> {
  console.warn('⚠️ Using mock test - no payment SDK, endpoint may return 402');

  // Call without walletClient - will not handle payments
  return testX402Endpoint({
    ...params,
    walletClient: undefined,
    solanaWallet: undefined
  });
}
