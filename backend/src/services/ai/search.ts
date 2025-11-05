import { getDatabase } from '../db/sqlite.js';
import { getEmbeddingService } from './embeddings.js';
import type { SearchResult } from '../../types/index.js';

export interface SearchOptions {
  limit?: number;
  minSimilarity?: number;
  useCache?: boolean;
}

/**
 * AI-powered search service
 * Combines vector search with 3-layer scoring
 */
export class SearchService {
  /**
   * Search for x402 services using AI-powered semantic search
   */
  async search(
    userQuery: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    const {
      limit = 10,
      minSimilarity = 0.3,
      useCache = true,
    } = options;

    const db = getDatabase();

    // Check cache first
    if (useCache) {
      const cacheKey = `search:${userQuery}:${limit}:${minSimilarity}`;
      const cached = db.cacheGet(cacheKey);
      if (cached) {
        console.log('✓ Cache hit for query:', userQuery);
        return cached;
      }
    }

    console.log(`🔍 Searching for: "${userQuery}"`);
    const startTime = Date.now();

    // Generate embedding for query
    const embeddingService = getEmbeddingService();
    const queryEmbedding = await embeddingService.generateEmbedding(userQuery);

    // Perform vector search
    const vectorResults = db.vectorSearch(queryEmbedding, limit * 2, minSimilarity);

    console.log(`   Found ${vectorResults.length} candidates`);

    // Calculate final scores with 3-layer formula
    const scoredResults = vectorResults.map((result) =>
      this.calculateFinalScore(result)
    );

    // Sort by final score (descending)
    scoredResults.sort((a, b) => (b.final_score || 0) - (a.final_score || 0));

    // Take top results
    const finalResults = scoredResults.slice(0, limit);

    const elapsed = Date.now() - startTime;
    console.log(`✓ Search completed in ${elapsed}ms (${finalResults.length} results)`);

    // Cache results
    if (useCache && finalResults.length > 0) {
      const cacheKey = `search:${userQuery}:${limit}:${minSimilarity}`;
      db.cacheSet(cacheKey, finalResults, 900); // 15 minutes
    }

    return finalResults;
  }

  /**
   * Calculate final score using simplified 2-layer formula
   * (Only Bazaar data available, no x402scan or xgate)
   *
   * Layer 1 (Bazaar Quality): 50% - Data completeness from Bazaar
   * Layer 3 (AI Similarity): 50% - Semantic similarity to query
   */
  private calculateFinalScore(result: any): SearchResult {
    // Layer 1: Foundation score (Bazaar data quality)
    const layer1Score = this.calculateLayer1Score(result);

    // Layer 3: Semantic similarity
    const layer3Score = result.similarity_score || 0;

    // Simplified weighted combination (50-50)
    const finalScore = layer1Score * 0.5 + layer3Score * 0.5;

    return {
      id: result.id,
      resource: result.resource,
      description: result.description,
      network: result.network,
      asset: result.asset,
      max_amount: result.max_amount,
      pay_to: result.pay_to,
      manifest: typeof result.manifest === 'string'
        ? JSON.parse(result.manifest)
        : result.manifest,
      similarity_score: result.similarity_score,
      final_score: finalScore,
      layer1_score: layer1Score,
      layer3_score: layer3Score,
    };
  }

  /**
   * Layer 1 Score: Foundation data quality
   * Based on manifest completeness and metadata
   */
  private calculateLayer1Score(result: any): number {
    let score = 0.5; // Base score

    // Has description
    if (result.description && result.description.length > 10) {
      score += 0.2;
    }

    // Has origin metadata
    if (result.trust_origin_title) {
      score += 0.15;
    }

    // Has complete manifest
    const manifest = typeof result.manifest === 'string'
      ? JSON.parse(result.manifest)
      : result.manifest;
    if (manifest && manifest.accepts?.length > 0) {
      score += 0.15;
    }

    return Math.min(score, 1.0);
  }
}

// Singleton instance
let searchService: SearchService | null = null;

export function getSearchService(): SearchService {
  if (!searchService) {
    searchService = new SearchService();
  }
  return searchService;
}
