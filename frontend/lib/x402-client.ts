import { X402Accept, X402Schema, TestResponse } from '@/types/service';
import { parseResponse } from './response-handler';
import { validateInput, validateOutput } from './schema-utils';
import { generateX402Headers, buildQueryString } from './x402-payment';

export interface TestEndpointParams {
  accept: X402Accept;
  inputData: any;
  inputSchema: X402Schema['input'] | null;
  outputSchema: any | null;
  txHash: string;
  facilitatorAddress: string;
  signature: string;
}

/**
 * Test x402 endpoint with payment proof
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

    // 2. Generate x402 headers
    const x402Headers = generateX402Headers({
      facilitator: params.facilitatorAddress,
      paymentHash: params.txHash,
      timestamp: Date.now(),
      signature: params.signature
    });

    // 3. Prepare request
    const method = params.inputSchema?.method || 'POST';
    const url = method === 'GET'
      ? `${params.accept.resource}?${buildQueryString(params.inputData)}`
      : params.accept.resource;

    const contentType = params.inputSchema?.bodyType === 'json'
      ? 'application/json'
      : (params.accept.mimeType || 'application/json');

    // 4. Call endpoint
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': contentType,
        ...x402Headers
      },
      body: method === 'POST' ? JSON.stringify(params.inputData) : undefined
    });

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

    // 7. Build response
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
      txHash: params.txHash,
      time: Date.now() - startTime
    };
  } catch (error) {
    console.error('Error testing x402 endpoint:', error);
    throw error;
  }
}

/**
 * Mock test for development (no actual payment)
 */
export async function mockTestEndpoint(
  params: Omit<TestEndpointParams, 'txHash' | 'facilitatorAddress' | 'signature'>
): Promise<TestResponse> {
  console.warn('⚠️ Using mock test - no actual payment sent');

  const mockParams: TestEndpointParams = {
    ...params,
    txHash: '0xmock' + Math.random().toString(36).substring(7),
    facilitatorAddress: '0xMockFacilitator',
    signature: '0xMockSignature'
  };

  return testX402Endpoint(mockParams);
}
