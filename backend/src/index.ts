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

// Initialize database and embeddings
async function initialize() {
  console.log('🚀 Synthex Backend Starting...');
  console.log('');

  try {
    // Initialize database
    console.log('📦 Initializing database...');
    const db = getDatabase();
    const stats = db.getStats();
    console.log(`   ✓ Database loaded: ${stats.services} services, ${stats.embeddings} embeddings`);
    console.log('');

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
