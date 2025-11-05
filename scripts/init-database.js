#!/usr/bin/env node

/**
 * Initialize Database
 * Fetches services from Bazaar and generates embeddings
 */

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const backendDir = join(__dirname, '../backend');

// Change to backend directory to properly load modules
process.chdir(backendDir);

// Dynamic imports after changing directory
const { getDatabase } = await import('../backend/src/services/db/sqlite.js');
const { bazaarClient } = await import('../backend/src/services/aggregators/bazaar.js');
const { ServiceNormalizer } = await import('../backend/src/services/aggregators/normalizer.js');
const { getEmbeddingService } = await import('../backend/src/services/ai/embeddings.js');

console.log('🗄️  Initializing Synthex Database\n');

async function initDatabase() {
  try {
    // Step 1: Initialize database
    console.log('1️⃣  Setting up database schema...');
    const db = getDatabase();
    console.log('   ✓ Database initialized\n');

    // Step 2: Fetch services from Bazaar
    console.log('2️⃣  Fetching services from Bazaar...');
    const bazaarServices = await bazaarClient.fetchServices();
    console.log(`   ✓ Fetched ${bazaarServices.length} services\n`);

    // Step 3: Normalize and insert services
    console.log('3️⃣  Normalizing and inserting services...');
    let inserted = 0;
    let failed = 0;

    for (const bazaarService of bazaarServices) {
      try {
        const normalized = ServiceNormalizer.normalizeBazaarService(bazaarService);

        if (!ServiceNormalizer.validate(normalized)) {
          console.warn(`   ⚠️  Skipping invalid service: ${normalized.resource}`);
          failed++;
          continue;
        }

        // Convert to SQLite format
        const service = {
          resource: normalized.resource,
          description: normalized.description,
          network: normalized.network,
          asset: normalized.asset,
          max_amount: Number(normalized.maxAmount),
          pay_to: normalized.payTo,
          manifest: JSON.stringify(normalized.manifest),
          trust_transaction_count: normalized.trustTransactionCount,
          trust_last_seen: normalized.trustLastSeen
            ? Math.floor(normalized.trustLastSeen.getTime() / 1000)
            : null,
          trust_origin_title: normalized.trustOriginTitle,
          trust_origin_description: normalized.trustOriginDescription,
          score_confidence: normalized.scoreConfidence,
          score_performance_ms: normalized.scorePerformanceMs,
          score_reliability: normalized.scoreReliability,
          score_popularity: normalized.scorePopularity,
          score_unique_users: normalized.scoreUniqueUsers,
          source_bazaar: normalized.sourceBazaar ? 1 : 0,
          source_x402scan: normalized.sourceX402scan ? 1 : 0,
          source_xgate: normalized.sourceXgate ? 1 : 0,
          last_updated: Math.floor(normalized.lastUpdated.getTime() / 1000),
        };

        db.upsertService(service);
        inserted++;

        if (inserted % 50 === 0) {
          console.log(`   Progress: ${inserted}/${bazaarServices.length} services inserted`);
        }
      } catch (error) {
        console.error(`   ❌ Failed to insert ${bazaarService.resource}:`, error.message);
        failed++;
      }
    }

    console.log(`   ✓ Inserted ${inserted} services (${failed} failed)\n`);

    // Step 4: Generate embeddings
    console.log('4️⃣  Generating embeddings...');
    console.log('   Loading embedding model (first run may download ~23MB)...');

    const embeddingService = getEmbeddingService();
    await embeddingService.initialize();

    const servicesWithoutEmbeddings = db.getServicesWithoutEmbeddings();
    console.log(`   Found ${servicesWithoutEmbeddings.length} services without embeddings`);

    let embeddingCount = 0;
    const batchSize = 10;

    for (let i = 0; i < servicesWithoutEmbeddings.length; i += batchSize) {
      const batch = servicesWithoutEmbeddings.slice(i, i + batchSize);

      for (const service of batch) {
        try {
          // Parse manifest
          const manifest = typeof service.manifest === 'string'
            ? JSON.parse(service.manifest)
            : service.manifest;

          // Create normalized service for text extraction
          const normalized = {
            ...service,
            maxAmount: BigInt(service.max_amount || 0),
            payTo: service.pay_to,
            manifest,
            trustTransactionCount: service.trust_transaction_count || 0,
            trustLastSeen: service.trust_last_seen
              ? new Date(service.trust_last_seen * 1000)
              : null,
            trustOriginTitle: service.trust_origin_title,
            trustOriginDescription: service.trust_origin_description,
            scoreConfidence: service.score_confidence || 0.5,
            scorePerformanceMs: service.score_performance_ms,
            scoreReliability: service.score_reliability || 0.5,
            scorePopularity: service.score_popularity || 0,
            scoreUniqueUsers: service.score_unique_users || 0,
            sourceBazaar: Boolean(service.source_bazaar),
            sourceX402scan: Boolean(service.source_x402scan),
            sourceXgate: Boolean(service.source_xgate),
            lastUpdated: new Date(service.last_updated * 1000),
          };

          const searchableText = ServiceNormalizer.extractSearchableText(normalized);
          const embedding = await embeddingService.generateEmbedding(searchableText);

          db.upsertEmbedding(service.id, embedding, embeddingService.getDimensions());
          embeddingCount++;

          if (embeddingCount % 10 === 0) {
            console.log(`   Progress: ${embeddingCount}/${servicesWithoutEmbeddings.length} embeddings generated`);
          }
        } catch (error) {
          console.error(`   ❌ Failed to generate embedding for service ${service.id}:`, error.message);
        }
      }
    }

    console.log(`   ✓ Generated ${embeddingCount} embeddings\n`);

    // Step 5: Show final stats
    console.log('📊 Final Statistics:');
    const stats = db.getStats();
    console.log(`   Services: ${stats.services}`);
    console.log(`   Embeddings: ${stats.embeddings}`);
    console.log(`   Database Size: ${(stats.dbSize / 1024 / 1024).toFixed(2)} MB`);
    console.log('');

    console.log('✅ Database initialization complete!\n');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();
