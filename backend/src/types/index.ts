/**
 * Synthex Types
 * Shared types for the backend
 */

export interface X402Manifest {
  resource: string;
  accepts: AcceptConfig[];
  metadata?: {
    name?: string;
    description?: string;
    tags?: string[];
    confidence?: {
      overallScore: number;
    };
    performance?: {
      avgLatencyMs: number;
    };
    reliability?: {
      apiSuccessRate: number;
    };
    paymentAnalytics?: {
      totalTransactions: number;
      totalUniqueUsers: number;
    };
  };
  [key: string]: any;
}

export interface AcceptConfig {
  network: string;
  asset: string;
  maxAmountRequired: string;
  payTo: string;
  description?: string;
}

export interface NormalizedService {
  resource: string;
  description: string;
  network: string;
  asset: string;
  maxAmount: bigint;
  payTo: string;
  manifest: X402Manifest;

  // Trust metrics
  trustTransactionCount: number;
  trustLastSeen: Date | null;
  trustOriginTitle: string | null;
  trustOriginDescription: string | null;

  // Scoring metrics
  scoreConfidence: number;
  scorePerformanceMs: number | null;
  scoreReliability: number;
  scorePopularity: number;
  scoreUniqueUsers: number;

  // Source tracking
  sourceBazaar: boolean;
  sourceX402scan: boolean;
  sourceXgate: boolean;

  // Timestamps
  lastUpdated: Date;
}

export interface SearchResult {
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
  layer1_score?: number;
  layer3_score?: number;
}
