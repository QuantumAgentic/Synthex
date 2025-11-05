import { config as loadEnv } from 'dotenv';

loadEnv();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    path: process.env.DATABASE_PATH || './data/synthex.db',
  },

  embedding: {
    model: process.env.EMBEDDING_MODEL || 'Xenova/all-MiniLM-L6-v2',
    dimensions: parseInt(process.env.EMBEDDING_DIMENSIONS || '384', 10),
  },

  cache: {
    searchTTL: parseInt(process.env.CACHE_SEARCH_TTL || '900', 10), // 15 minutes
    embeddingTTL: parseInt(process.env.CACHE_EMBEDDING_TTL || '3600', 10), // 1 hour
  },

  sources: {
    bazaar: 'https://bazaar.x402.network/v2',
  },

  cors: {
    origins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  },

  polling: {
    intervalMinutes: parseInt(process.env.POLLING_INTERVAL_MINUTES || '15', 10),
  },
};
