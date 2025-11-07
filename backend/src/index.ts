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

    // Calculate total steps for unified progress
    const totalSteps = bazaarServices.length * 2; // insert + embedding for each service
    let currentStep = 0;

    // Step 2: Normalize and insert services
    console.log('🚀 Initializing database (this may take a few minutes)...');
    console.log('');

    let inserted = 0;
    let failed = 0;

    // Load embedding model first
    const embeddingService = getEmbeddingService();
    await embeddingService.initialize();

    for (let i = 0; i < bazaarServices.length; i++) {
      const bazaarService = bazaarServices[i];
      try {
        const normalized = ServiceNormalizer.normalizeBazaarService(bazaarService);

        if (!ServiceNormalizer.validate(normalized)) {
          failed++;
          currentStep += 2; // Skip both insert and embedding
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
        currentStep++;

        // Generate embedding immediately
        const serviceFromDb = db.getServiceById(service.resource);
        if (serviceFromDb) {
          try {
            const manifest = typeof serviceFromDb.manifest === 'string'
              ? JSON.parse(serviceFromDb.manifest)
              : serviceFromDb.manifest;

            const normalizedForEmbed = {
              ...serviceFromDb,
              maxAmount: BigInt(serviceFromDb.max_amount || 0),
              payTo: serviceFromDb.pay_to,
              manifest,
              trustTransactionCount: serviceFromDb.trust_transaction_count || 0,
              trustLastSeen: serviceFromDb.trust_last_seen
                ? new Date(serviceFromDb.trust_last_seen * 1000)
                : null,
              trustOriginTitle: serviceFromDb.trust_origin_title,
              trustOriginDescription: serviceFromDb.trust_origin_description,
              scoreConfidence: serviceFromDb.score_confidence || 0.5,
              scorePerformanceMs: serviceFromDb.score_performance_ms,
              scoreReliability: serviceFromDb.score_reliability || 0.5,
              scorePopularity: serviceFromDb.score_popularity || 0,
              scoreUniqueUsers: serviceFromDb.score_unique_users || 0,
              sourceBazaar: Boolean(serviceFromDb.source_bazaar),
              sourceX402scan: Boolean(serviceFromDb.source_x402scan),
              sourceXgate: Boolean(serviceFromDb.source_xgate),
              lastUpdated: new Date(serviceFromDb.last_updated * 1000),
            };

            const searchableText = ServiceNormalizer.extractSearchableText(normalizedForEmbed);
            const embedding = await embeddingService.generateEmbedding(searchableText);
            db.upsertEmbedding(serviceFromDb.id, embedding, embeddingService.getDimensions());
            currentStep++;
          } catch {
            currentStep++;
          }
        } else {
          currentStep++;
        }

        // Update progress bar every 2%
        if (currentStep % Math.ceil(totalSteps / 50) === 0 || currentStep === totalSteps) {
          const percent = Math.round((currentStep / totalSteps) * 100);
          const bar = '█'.repeat(Math.floor(percent / 5)) + '░'.repeat(20 - Math.floor(percent / 5));
          const phase = currentStep <= bazaarServices.length ? 'Inserting' : 'Generating embeddings';
          process.stdout.write(`\r   [${bar}] ${percent}% - ${phase}... (${inserted}/${bazaarServices.length} processed)`);
        }
      } catch (error) {
        failed++;
        currentStep += 2;
      }
    }

    console.log('');
    console.log('');

    const finalStats = db.getStats();
    console.log('✅ First-time setup complete!');
    console.log(`   📊 ${finalStats.services} services indexed`);
    console.log(`   🎯 ${finalStats.embeddings} AI embeddings ready`);
    console.log(`   💾 Database size: ${(finalStats.dbSize / 1024 / 1024).toFixed(2)} MB`);
    if (failed > 0) console.log(`   ⚠️  ${failed} services failed to process`);
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
