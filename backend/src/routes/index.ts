import { Router, Request, Response } from 'express';
import { getDatabase } from '../services/db/sqlite.js';
import { getSearchService } from '../services/ai/search.js';

const router = Router();

/**
 * GET /health
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const stats = db.getStats();

    res.json({
      status: 'ok',
      database: {
        services: stats.services,
        embeddings: stats.embeddings,
        size: `${(stats.dbSize / 1024 / 1024).toFixed(2)} MB`,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /search
 * Search x402 services
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        error: 'Query parameter "q" is required',
      });
    }

    const limit = parseInt(req.query.limit as string) || 10;
    const minSimilarity = parseFloat(req.query.minSimilarity as string) || 0.3;

    const searchService = getSearchService();
    const results = await searchService.search(query, {
      limit,
      minSimilarity,
      useCache: true,
    });

    res.json({
      query,
      results,
      count: results.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /services
 * List all services (paginated)
 */
router.get('/services', (_req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const limit = parseInt(_req.query.limit as string) || 50;
    const services = db.getAllServices(limit);

    // Parse manifest JSON strings
    const parsedServices = services.map(service => ({
      ...service,
      manifest: typeof service.manifest === 'string'
        ? JSON.parse(service.manifest)
        : service.manifest,
    }));

    res.json({
      services: parsedServices,
      count: parsedServices.length,
      total: db.countServices(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Services error:', error);
    res.status(500).json({
      error: 'Failed to fetch services',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /services/:id
 * Get service by ID
 */
router.get('/services/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid service ID' });
    }

    const db = getDatabase();
    const service = db.getServiceById(id);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Parse manifest
    const parsedService = {
      ...service,
      manifest: typeof service.manifest === 'string'
        ? JSON.parse(service.manifest)
        : service.manifest,
    };

    res.json(parsedService);
  } catch (error) {
    console.error('Service fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch service',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /stats
 * Get database statistics
 */
router.get('/stats', (_req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const stats = db.getStats();

    res.json({
      services: stats.services,
      embeddings: stats.embeddings,
      dbSize: stats.dbSize,
      dbSizeMB: (stats.dbSize / 1024 / 1024).toFixed(2),
      cachePruned: stats.cachePruned,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch stats',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
