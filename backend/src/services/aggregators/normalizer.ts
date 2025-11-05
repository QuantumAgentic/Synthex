import type { X402Manifest, NormalizedService } from '../../types/index.js';
import type { BazaarService } from './bazaar.js';

/**
 * Normalize services from different sources to unified format
 */
export class ServiceNormalizer {
  /**
   * Normalize Bazaar service to our database format
   */
  static normalizeBazaarService(bazaarService: BazaarService): NormalizedService {
    const { manifest } = bazaarService;

    // Get first accept config
    const primaryAccept = manifest.accepts[0];

    if (!primaryAccept) {
      throw new Error(`Service ${manifest.resource} has no accept configuration`);
    }

    return {
      resource: manifest.resource,
      description: primaryAccept.description || manifest.metadata?.description || 'No description',
      network: primaryAccept.network,
      asset: primaryAccept.asset,
      maxAmount: BigInt(primaryAccept.maxAmountRequired),
      payTo: primaryAccept.payTo,
      manifest: manifest,

      // Trust metrics
      trustTransactionCount: manifest.metadata?.paymentAnalytics?.totalTransactions || 0,
      trustLastSeen: new Date(),
      trustOriginTitle: manifest.metadata?.name || null,
      trustOriginDescription: manifest.metadata?.description || null,

      // Scoring metrics
      scoreConfidence: manifest.metadata?.confidence?.overallScore || 0.5,
      scorePerformanceMs: manifest.metadata?.performance?.avgLatencyMs || null,
      scoreReliability: manifest.metadata?.reliability?.apiSuccessRate || 0.5,
      scorePopularity: 0,
      scoreUniqueUsers: manifest.metadata?.paymentAnalytics?.totalUniqueUsers || 0,

      // Source tracking
      sourceBazaar: true,
      sourceX402scan: false,
      sourceXgate: false,

      // Timestamps
      lastUpdated: new Date(bazaarService.updatedAt || Date.now()),
    };
  }

  /**
   * Extract searchable text from service for embeddings
   * Format: "name | description | network:X | asset:Y | tags:A,B,C"
   */
  static extractSearchableText(service: NormalizedService): string {
    const name = service.manifest.metadata?.name ||
                 service.trustOriginTitle ||
                 this.extractNameFromResourceUrl(service.resource);

    const description = service.description || '';
    const network = service.network || '';
    const asset = service.asset || '';
    const tags = service.manifest.metadata?.tags || [];

    const parts = [
      name,
      description,
      network ? `network:${network}` : '',
      asset ? `asset:${asset}` : '',
      tags.length > 0 ? `tags:${tags.join(',')}` : ''
    ].filter(Boolean);

    return parts.join(' | ');
  }

  /**
   * Extract a human-readable name from the resource URL
   */
  private static extractNameFromResourceUrl(resourceUrl: string): string {
    try {
      const url = new URL(resourceUrl);

      let domain = url.hostname
        .replace(/^(www|api|staging|api-dev|api-staging)\./, '')
        .split('.')[0];

      const pathSegments = url.pathname
        .split('/')
        .filter(Boolean)
        .filter(seg => !seg.match(/^(api|v1|v2|x402|qrn:swarm:|qrn:agent:)/))
        .slice(0, 2);

      const nameParts = [domain, ...pathSegments]
        .map(part => {
          return part
            .replace(/[^a-zA-Z0-9]/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .toLowerCase()
            .trim();
        })
        .filter(Boolean);

      return nameParts.join(' ').substring(0, 50);
    } catch (error) {
      return '';
    }
  }

  /**
   * Validate normalized service
   */
  static validate(service: NormalizedService): boolean {
    return !!(
      service.resource &&
      service.description &&
      service.network &&
      service.asset &&
      service.maxAmount >= 0n &&
      service.payTo
    );
  }
}
