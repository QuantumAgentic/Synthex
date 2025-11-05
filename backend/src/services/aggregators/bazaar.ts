import { config } from '../../config/env.js';
import type { X402Manifest } from '../../types/index.js';

/**
 * Coinbase Bazaar API Client
 * Layer 1: Foundation data source
 */
export class BazaarClient {
  private retryAttempts = 3;
  private retryDelay = 1000;

  private get baseUrl(): string {
    return config.sources.bazaar;
  }

  /**
   * Fetch all x402 services from Bazaar with pagination support
   */
  async fetchServices(): Promise<BazaarService[]> {
    try {
      console.log('📡 Fetching ALL services from Coinbase Bazaar with pagination...');
      console.log(`   🔗 Base URL: ${this.baseUrl}`);

      const limit = 1000;
      let offset = 0;
      let allServices: BazaarService[] = [];
      let total = 0;

      // First fetch to get total count
      const url = `${this.baseUrl}/resources?limit=${limit}&offset=${offset}`;
      console.log(`   🌐 Fetching: ${url}`);

      const firstResponse = await this.fetchWithRetry(url);

      if (!firstResponse.ok) {
        throw new Error(`Bazaar API error: ${firstResponse.status} ${firstResponse.statusText}`);
      }

      const firstData = await firstResponse.json() as any;
      total = firstData.pagination?.total || firstData.items?.length || 0;

      console.log(`   📊 Total services available: ${total}`);
      console.log(`   📄 Fetching in batches of ${limit}...`);

      // Parse first batch
      const firstBatch = this.parseServicesResponse(firstData);
      allServices = allServices.concat(firstBatch);
      console.log(`   ✅ Batch 1: Fetched ${firstBatch.length} services (${allServices.length}/${total})`);

      // Fetch remaining pages
      offset += limit;
      let batchNumber = 2;

      while (allServices.length < total) {
        const response = await this.fetchWithRetry(
          `${this.baseUrl}/resources?limit=${limit}&offset=${offset}`
        );

        if (!response.ok) {
          console.warn(`   ⚠️  Batch ${batchNumber} failed: ${response.status} ${response.statusText}`);
          break;
        }

        const data = await response.json() as any;
        const batch = this.parseServicesResponse(data);

        if (batch.length === 0) {
          console.log(`   ✅ No more services, stopping pagination`);
          break;
        }

        allServices = allServices.concat(batch);
        console.log(`   ✅ Batch ${batchNumber}: Fetched ${batch.length} services (${allServices.length}/${total})`);

        offset += limit;
        batchNumber++;

        if (batchNumber > 50) {
          console.warn(`   ⚠️  Reached max batch limit (50), stopping pagination`);
          break;
        }

        await this.delay(500);
      }

      console.log(`✅ Fetched ${allServices.length} total services from Bazaar`);
      return allServices;
    } catch (error) {
      console.error('❌ Failed to fetch from Bazaar:', error);
      throw error;
    }
  }

  private parseServicesResponse(data: any): BazaarService[] {
    const services = data.items || data.services || data.results || data || [];

    if (!Array.isArray(services)) {
      console.warn('Unexpected Bazaar response format');
      return [];
    }

    return services.map((service: any) => ({
      resource: service.resource,
      manifest: service,
      updatedAt: service.lastUpdated || service.updatedAt || new Date().toISOString(),
    }));
  }

  private async fetchWithRetry(url: string, attempt = 1): Promise<Response> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Synthex/1.0',
        },
        signal: AbortSignal.timeout(10000),
      });

      return response;
    } catch (error) {
      if (attempt < this.retryAttempts) {
        console.log(`Retry attempt ${attempt}/${this.retryAttempts}...`);
        await this.delay(this.retryDelay * attempt);
        return this.fetchWithRetry(url, attempt + 1);
      }
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export interface BazaarService {
  resource: string;
  manifest: X402Manifest;
  updatedAt: string;
}

// Singleton instance
export const bazaarClient = new BazaarClient();
