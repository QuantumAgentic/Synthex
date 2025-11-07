import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import { getDatabase, closeDatabase } from './services/db/sqlite.js';
import { initializeEmbeddings } from './services/ai/embeddings.js';
import router from './routes/index.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.origins,
  credentials: true,
}));
app.use(express.json());

// Logging middleware
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/', router);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : undefined,
  });
});

// Auto-initialization function
async function autoInitialize() {
  const { bazaarClient } = await import('./services/aggregators/bazaar.js');
  const { ServiceNormalizer } = await import('./services/aggregators/normalizer.js');
  const { getEmbeddingService } = await import('./services/ai/embeddings.js');

  console.log('');
  console.log('🎉 Welcome to Synthex! First-time setup detected.');
  console.log('   We\'ll fetch services from Bazaar and prepare your database.');
  console.log('   This will take 5-10 minutes depending on your connection.');
  console.log('');

  const db = getDatabase();

  try {
    // Step 1: Fetch services from Bazaar
    console.log('📡 Fetching services from Coinbase Bazaar...');
    const bazaarServices = await bazaarClient.fetchServices();
    console.log(`   ✓ Fetched ${bazaarServices.length} services`);
    console.log('');

    // Step 2: Normalize and insert services
    console.log('💾 Inserting services into database...');
    let inserted = 0;
    let failed = 0;
    const total = bazaarServices.length;

    for (let i = 0; i < bazaarServices.length; i++) {
      const bazaarService = bazaarServices[i];
      try {
        const normalized = ServiceNormalizer.normalizeBazaarService(bazaarService);

        if (!ServiceNormalizer.validate(normalized)) {
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

        // Progress every 10%
        if (inserted % Math.ceil(total / 10) === 0 || inserted === total) {
          const percent = Math.round((inserted / total) * 100);
          const bar = '█'.repeat(Math.floor(percent / 5)) + '░'.repeat(20 - Math.floor(percent / 5));
          process.stdout.write(`\r   [${bar}] ${percent}% (${inserted}/${total})`);
        }
      } catch (error) {
        failed++;
      }
    }

    console.log('');
    console.log(`   ✓ Inserted ${inserted} services` + (failed > 0 ? ` (${failed} failed)` : ''));
    console.log('');

    // Step 3: Generate embeddings
    console.log('🤖 Generating AI embeddings (this may take a few minutes)...');
    console.log('   Loading embedding model (first run downloads ~23MB)...');

    const embeddingService = getEmbeddingService();
    await embeddingService.initialize();
    console.log('   ✓ Model loaded');

    const servicesWithoutEmbeddings = db.getServicesWithoutEmbeddings();
    const embTotal = servicesWithoutEmbeddings.length;
    let embeddingCount = 0;

    for (const service of servicesWithoutEmbeddings) {
      try {
        const manifest = typeof service.manifest === 'string'
          ? JSON.parse(service.manifest)
          : service.manifest;

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

        // Progress every 5%
        if (embeddingCount % Math.ceil(embTotal / 20) === 0 || embeddingCount === embTotal) {
          const percent = Math.round((embeddingCount / embTotal) * 100);
          const bar = '█'.repeat(Math.floor(percent / 5)) + '░'.repeat(20 - Math.floor(percent / 5));
          process.stdout.write(`\r   [${bar}] ${percent}% (${embeddingCount}/${embTotal})`);
        }
      } catch (error) {
        // Skip failed embeddings silently
      }
    }

    console.log('');
    console.log(`   ✓ Generated ${embeddingCount} embeddings`);
    console.log('');

    const finalStats = db.getStats();
    console.log('✅ First-time setup complete!');
    console.log(`   📊 ${finalStats.services} services indexed`);
    console.log(`   🎯 ${finalStats.embeddings} AI embeddings ready`);
    console.log(`   💾 Database size: ${(finalStats.dbSize / 1024 / 1024).toFixed(2)} MB`);
    console.log('');
  } catch (error) {
    console.error('');
    console.error('❌ Auto-initialization failed:', error);
    console.error('   You can retry manually with: node scripts/init-database.js');
    console.error('');
    throw error;
  }
}

// Initialize database and embeddings
async function initialize() {
  console.log('🚀 Synthex Backend Starting...');
  console.log('');

  try {
    // Initialize database
    console.log('📦 Initializing database...');
    const db = getDatabase();
    const stats = db.getStats();
    console.log(`   ✓ SQLite database initialized`);
    console.log(`   ✓ Database loaded: ${stats.services} services, ${stats.embeddings} embeddings`);

    // Check if first run (no services)
    if (stats.services === 0) {
      console.log('');
      await autoInitialize();
    } else {
      console.log('');
    }

    // Initialize embedding model
    console.log('🤖 Loading AI models...');
    await initializeEmbeddings();
    console.log('');

    // Start server
    app.listen(config.port, () => {
      console.log('✅ Synthex Backend Ready!');
      console.log('');
      console.log(`   🌐 Server: http://localhost:${config.port}`);
      console.log(`   🔍 Search: http://localhost:${config.port}/search?q=weather`);
      console.log(`   📊 Health: http://localhost:${config.port}/health`);
      console.log(`   📈 Stats: http://localhost:${config.port}/stats`);
      console.log('');
      console.log('Press Ctrl+C to stop');
    });
  } catch (error) {
    console.error('❌ Failed to start:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down...');
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Shutting down...');
  closeDatabase();
  process.exit(0);
});

// Start
initialize();
