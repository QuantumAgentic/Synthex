// X402 Protocol Types (from shared/types.ts)

export interface X402Manifest {
  resource: string;
  type: 'http';
  x402Version: number;
  lastUpdated?: string;
  metadata?: BazaarMetadata;
  accepts: X402Accept[];
}

export interface X402Accept {
  asset: string;
  description: string;
  scheme: string;
  network: string;
  maxAmountRequired: string;
  maxTimeoutSeconds: number;
  mimeType: string;
  payTo: string;
  resource: string;
  outputSchema?: X402Schema;
  extra?: {
    name?: string;
    version?: string;
  };
}

export interface X402Schema {
  input: {
    method: 'GET' | 'POST';
    type: 'http';
    discoverable?: boolean;
    queryParams?: Record<string, any>;
    bodyFields?: Record<string, SchemaField>;
    bodyType?: 'json';
  };
  output?: Record<string, any> | {
    properties?: Record<string, any>;
    required?: string[];
    type?: string;
  };
}

export interface SchemaField {
  type: string;
  description?: string;
  required?: boolean;
  default?: any;
  enum?: any[];
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  format?: string;
}

export interface BazaarMetadata {
  confidence?: {
    overallScore: number;
    performanceScore: number;
    recencyScore: number;
    reliabilityScore: number;
    volumeScore: number;
  };
  paymentAnalytics?: {
    totalTransactions: number;
    totalUniqueUsers: number;
    averageDailyTransactions: number;
    transactions24h?: number;
    transactionsWeek?: number;
    transactionsMonth?: number;
  };
  performance?: {
    avgLatencyMs: number;
    minLatencyMs?: number;
    maxLatencyMs?: number;
    recentAvgLatencyMs?: number;
  };
  reliability?: {
    apiSuccessRate: number;
    successfulSettlements: number;
    totalRequests: number;
  };
  errorAnalysis?: {
    abandonedFlows: number;
    apiErrors: number;
    delayedSettlements: number;
    facilitatorErrors: number;
    requestErrors: number;
  };
}

// Service Data (from search results)
export interface ServiceData {
  resource: string;
  description: string;
  network: string;
  asset: string;
  maxAmount: string;
  payTo: string;
  manifest: X402Manifest;
  similarity: number;
  score: number;
  scores: {
    layer1: number;
    layer2A: number;
    layer2B: number;
    layer3: number;
    final: number;
  };
  trustMetrics: {
    transactionCount: number;
    lastSeen: Date | null;
    originTitle: string | null;
    originDescription: string | null;
  };
  sources: {
    bazaar: boolean;
    x402scan: boolean;
    xgate: boolean;
  };
}

// Response Types
export type ResponseType =
  | 'json'
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'text'
  | 'binary';

export interface TestResponse {
  success: boolean;
  status: number;
  contentType: string;
  responseType: ResponseType;
  data?: any;              // For JSON
  blob?: Blob;             // For binary
  text?: string;           // For text
  url?: string;            // Temporary URL for media
  schemaValid?: boolean;   // Only for JSON
  schemaErrors?: any[];    // Only for JSON
  txHash: string;
  time: number;
}

export interface ParsedResponse {
  type: ResponseType;
  data?: any;
  blob?: Blob;
  url?: string;
  text?: string;
  contentType?: string;
  size?: number;
}

// Wallet Types
export interface WalletConnection {
  address: string;
  network: string;
  connected: boolean;
}
