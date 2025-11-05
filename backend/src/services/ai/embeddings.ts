import { pipeline, env, FeatureExtractionPipeline } from '@xenova/transformers';

// Configure transformers.js
env.allowLocalModels = true;
env.allowRemoteModels = true;

export interface EmbeddingOptions {
  pooling?: 'mean' | 'cls';
  normalize?: boolean;
}

export class LocalEmbeddingService {
  private embedder: FeatureExtractionPipeline | null = null;
  private modelName: string;
  private dimensions: number;
  private isLoading: boolean = false;
  private loadPromise: Promise<void> | null = null;

  constructor(
    modelName: string = 'Xenova/all-MiniLM-L6-v2',
    dimensions: number = 384
  ) {
    this.modelName = modelName;
    this.dimensions = dimensions;
  }

  async initialize(): Promise<void> {
    if (this.embedder) return;

    // If already loading, wait for it
    if (this.isLoading && this.loadPromise) {
      return this.loadPromise;
    }

    this.isLoading = true;
    this.loadPromise = (async () => {
      try {
        console.log(`Loading embedding model: ${this.modelName}...`);
        const start = Date.now();

        this.embedder = await pipeline('feature-extraction', this.modelName);

        const elapsed = Date.now() - start;
        console.log(`✓ Embedding model loaded in ${elapsed}ms`);
      } catch (error) {
        console.error('Failed to load embedding model:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    })();

    return this.loadPromise;
  }

  async generateEmbedding(
    text: string,
    options: EmbeddingOptions = {}
  ): Promise<Float32Array> {
    await this.initialize();

    if (!this.embedder) {
      throw new Error('Embedding model not initialized');
    }

    try {
      const start = Date.now();

      const result = await this.embedder(text, {
        pooling: options.pooling || 'mean',
        normalize: options.normalize !== false // Default to true
      });

      const elapsed = Date.now() - start;

      // Extract Float32Array from tensor
      let embedding: Float32Array;
      if (result.data instanceof Float32Array) {
        embedding = result.data;
      } else if (Array.isArray(result.data)) {
        embedding = new Float32Array(result.data);
      } else {
        embedding = new Float32Array(result.tolist());
      }

      // Verify dimensions
      if (embedding.length !== this.dimensions) {
        console.warn(
          `Warning: Expected ${this.dimensions} dimensions, got ${embedding.length}`
        );
      }

      console.log(`Generated embedding in ${elapsed}ms (${embedding.length} dims)`);

      return embedding;
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      throw error;
    }
  }

  async generateBatch(
    texts: string[],
    options: EmbeddingOptions = {}
  ): Promise<Float32Array[]> {
    await this.initialize();

    if (!this.embedder) {
      throw new Error('Embedding model not initialized');
    }

    console.log(`Generating embeddings for ${texts.length} texts...`);
    const start = Date.now();

    try {
      // Process in batches to avoid memory issues
      const batchSize = 32;
      const results: Float32Array[] = [];

      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(text => this.generateEmbedding(text, options))
        );
        results.push(...batchResults);

        const progress = Math.min(i + batchSize, texts.length);
        console.log(`  ${progress}/${texts.length} embeddings generated`);
      }

      const elapsed = Date.now() - start;
      const avgTime = elapsed / texts.length;
      console.log(
        `✓ Generated ${texts.length} embeddings in ${elapsed}ms (avg ${avgTime.toFixed(1)}ms per text)`
      );

      return results;
    } catch (error) {
      console.error('Failed to generate batch embeddings:', error);
      throw error;
    }
  }

  getDimensions(): number {
    return this.dimensions;
  }

  getModelName(): string {
    return this.modelName;
  }

  isReady(): boolean {
    return this.embedder !== null;
  }

  async warmup(): Promise<void> {
    console.log('Warming up embedding model...');
    await this.generateEmbedding('test');
    console.log('✓ Model warmed up');
  }
}

// Singleton instance
let embeddingService: LocalEmbeddingService | null = null;

export function getEmbeddingService(): LocalEmbeddingService {
  if (!embeddingService) {
    const modelName = process.env.EMBEDDING_MODEL || 'Xenova/all-MiniLM-L6-v2';
    const dimensions = parseInt(process.env.EMBEDDING_DIMENSIONS || '384', 10);

    embeddingService = new LocalEmbeddingService(modelName, dimensions);
  }

  return embeddingService;
}

export async function initializeEmbeddings(): Promise<void> {
  const service = getEmbeddingService();
  await service.initialize();
  await service.warmup();
}
