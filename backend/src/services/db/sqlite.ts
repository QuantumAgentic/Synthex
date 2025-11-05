import Database from 'better-sqlite3';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

export interface Service {
  id?: number;
  resource: string;
  description: string;
  network: string;
  asset: string;
  max_amount: number;
  pay_to: string;
  manifest: string; // JSON string
  trust_transaction_count?: number;
  trust_last_seen?: number;
  trust_origin_title?: string;
  trust_origin_description?: string;
  score_confidence?: number;
  score_performance_ms?: number;
  score_reliability?: number;
  score_popularity?: number;
  score_unique_users?: number;
  source_bazaar?: number;
  source_x402scan?: number;
  source_xgate?: number;
  last_updated: number;
  created_at?: number;
  updated_at?: number;
}

export interface CacheEntry {
  key: string;
  value: string;
  expiry: number;
}

export interface VectorSearchResult extends Service {
  distance: number;
  similarity_score: number;
}

export class SQLiteService {
  private db: Database.Database;
  private dbPath: string;

  constructor(dbPath: string = './data/synthex.db') {
    this.dbPath = dbPath;

    // Ensure data directory exists
    const dir = dirname(dbPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('cache_size = -64000'); // 64MB cache

    this.initialize();
  }

  private initialize() {
    // Create main services table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS x402_services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        resource TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        network TEXT NOT NULL,
        asset TEXT NOT NULL,
        max_amount INTEGER NOT NULL,
        pay_to TEXT NOT NULL,
        manifest TEXT NOT NULL,

        -- Layer 2A: Trust metrics
        trust_transaction_count INTEGER DEFAULT 0,
        trust_last_seen INTEGER,
        trust_origin_title TEXT,
        trust_origin_description TEXT,

        -- Layer 2B: Scoring
        score_confidence REAL DEFAULT 0.5,
        score_performance_ms INTEGER,
        score_reliability REAL DEFAULT 0.5,
        score_popularity INTEGER DEFAULT 0,
        score_unique_users INTEGER DEFAULT 0,

        -- Source tracking
        source_bazaar INTEGER DEFAULT 1,
        source_x402scan INTEGER DEFAULT 0,
        source_xgate INTEGER DEFAULT 0,

        -- Timestamps
        last_updated INTEGER NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      );

      CREATE INDEX IF NOT EXISTS idx_network ON x402_services(network);
      CREATE INDEX IF NOT EXISTS idx_max_amount ON x402_services(max_amount);
      CREATE INDEX IF NOT EXISTS idx_last_updated ON x402_services(last_updated);
      CREATE INDEX IF NOT EXISTS idx_resource ON x402_services(resource);
    `);

    // Create embeddings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS x402_embeddings (
        service_id INTEGER PRIMARY KEY,
        embedding BLOB NOT NULL,
        dimensions INTEGER NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (service_id) REFERENCES x402_services(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_embedding_service ON x402_embeddings(service_id);
    `);

    // Create cache table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS cache (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        expiry INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_cache_expiry ON cache(expiry);
    `);

    console.log('✓ SQLite database initialized');
  }

  // Service CRUD operations
  upsertService(service: Service): number {
    const stmt = this.db.prepare(`
      INSERT INTO x402_services (
        resource, description, network, asset, max_amount, pay_to, manifest,
        trust_transaction_count, trust_last_seen, trust_origin_title, trust_origin_description,
        score_confidence, score_performance_ms, score_reliability, score_popularity, score_unique_users,
        source_bazaar, source_x402scan, source_xgate, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(resource) DO UPDATE SET
        description = excluded.description,
        network = excluded.network,
        asset = excluded.asset,
        max_amount = excluded.max_amount,
        pay_to = excluded.pay_to,
        manifest = excluded.manifest,
        trust_transaction_count = excluded.trust_transaction_count,
        trust_last_seen = excluded.trust_last_seen,
        trust_origin_title = excluded.trust_origin_title,
        trust_origin_description = excluded.trust_origin_description,
        score_confidence = excluded.score_confidence,
        score_performance_ms = excluded.score_performance_ms,
        score_reliability = excluded.score_reliability,
        score_popularity = excluded.score_popularity,
        score_unique_users = excluded.score_unique_users,
        source_bazaar = excluded.source_bazaar,
        source_x402scan = excluded.source_x402scan,
        source_xgate = excluded.source_xgate,
        last_updated = excluded.last_updated,
        updated_at = strftime('%s', 'now')
    `);

    const result = stmt.run(
      service.resource,
      service.description,
      service.network,
      service.asset,
      service.max_amount,
      service.pay_to,
      service.manifest,
      service.trust_transaction_count || 0,
      service.trust_last_seen || null,
      service.trust_origin_title || null,
      service.trust_origin_description || null,
      service.score_confidence || 0.5,
      service.score_performance_ms || null,
      service.score_reliability || 0.5,
      service.score_popularity || 0,
      service.score_unique_users || 0,
      service.source_bazaar || 1,
      service.source_x402scan || 0,
      service.source_xgate || 0,
      service.last_updated
    );

    return result.lastInsertRowid as number;
  }

  getServiceById(id: number): Service | null {
    const stmt = this.db.prepare('SELECT * FROM x402_services WHERE id = ?');
    return stmt.get(id) as Service | null;
  }

  getServiceByResource(resource: string): Service | null {
    const stmt = this.db.prepare('SELECT * FROM x402_services WHERE resource = ?');
    return stmt.get(resource) as Service | null;
  }

  getAllServices(limit?: number): Service[] {
    const query = limit
      ? `SELECT * FROM x402_services ORDER BY last_updated DESC LIMIT ${limit}`
      : 'SELECT * FROM x402_services ORDER BY last_updated DESC';
    const stmt = this.db.prepare(query);
    return stmt.all() as Service[];
  }

  getServicesWithoutEmbeddings(): Service[] {
    const stmt = this.db.prepare(`
      SELECT s.* FROM x402_services s
      LEFT JOIN x402_embeddings e ON s.id = e.service_id
      WHERE e.service_id IS NULL
    `);
    return stmt.all() as Service[];
  }

  countServices(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM x402_services');
    const result = stmt.get() as { count: number };
    return result.count;
  }

  // Embedding operations
  upsertEmbedding(serviceId: number, embedding: Float32Array, dimensions: number): void {
    const buffer = Buffer.from(embedding.buffer);

    const stmt = this.db.prepare(`
      INSERT INTO x402_embeddings (service_id, embedding, dimensions)
      VALUES (?, ?, ?)
      ON CONFLICT(service_id) DO UPDATE SET
        embedding = excluded.embedding,
        dimensions = excluded.dimensions,
        created_at = strftime('%s', 'now')
    `);

    stmt.run(serviceId, buffer, dimensions);
  }

  getEmbedding(serviceId: number): Float32Array | null {
    const stmt = this.db.prepare('SELECT embedding, dimensions FROM x402_embeddings WHERE service_id = ?');
    const result = stmt.get(serviceId) as { embedding: Buffer; dimensions: number } | undefined;

    if (!result) return null;

    return new Float32Array(result.embedding.buffer);
  }

  countEmbeddings(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM x402_embeddings');
    const result = stmt.get() as { count: number };
    return result.count;
  }

  // Vector search using cosine similarity
  vectorSearch(queryEmbedding: Float32Array, limit: number = 10, minSimilarity: number = 0.0): VectorSearchResult[] {
    // Get all embeddings and compute similarity in-memory
    // Note: For production with many embeddings, consider using sqlite-vss extension
    const stmt = this.db.prepare(`
      SELECT s.*, e.embedding, e.dimensions
      FROM x402_services s
      JOIN x402_embeddings e ON s.id = e.service_id
    `);

    const results = stmt.all() as Array<Service & { embedding: Buffer; dimensions: number }>;

    // Compute cosine similarity for each
    const scored = results.map(row => {
      const embedding = new Float32Array(row.embedding.buffer);
      const similarity = this.cosineSimilarity(queryEmbedding, embedding);

      const { embedding: _, dimensions: __, ...service } = row;

      return {
        ...service,
        distance: 1 - similarity,
        similarity_score: similarity
      } as VectorSearchResult;
    });

    // Filter and sort by similarity
    return scored
      .filter(r => r.similarity_score >= minSimilarity)
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, limit);
  }

  private cosineSimilarity(a: Float32Array, b: Float32Array): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Cache operations
  cacheSet(key: string, value: any, ttlSeconds: number): void {
    const expiry = Math.floor(Date.now() / 1000) + ttlSeconds;
    const valueStr = JSON.stringify(value);

    const stmt = this.db.prepare(`
      INSERT INTO cache (key, value, expiry)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        expiry = excluded.expiry
    `);

    stmt.run(key, valueStr, expiry);
  }

  cacheGet(key: string): any | null {
    const now = Math.floor(Date.now() / 1000);
    const stmt = this.db.prepare('SELECT value, expiry FROM cache WHERE key = ?');
    const result = stmt.get(key) as { value: string; expiry: number } | undefined;

    if (!result) return null;

    // Check if expired
    if (now > result.expiry) {
      this.cacheDelete(key);
      return null;
    }

    return JSON.parse(result.value);
  }

  cacheDelete(key: string): void {
    const stmt = this.db.prepare('DELETE FROM cache WHERE key = ?');
    stmt.run(key);
  }

  cacheCleanup(): number {
    const now = Math.floor(Date.now() / 1000);
    const stmt = this.db.prepare('DELETE FROM cache WHERE expiry < ?');
    const result = stmt.run(now);
    return result.changes;
  }

  // Utility
  close(): void {
    this.db.close();
  }

  vacuum(): void {
    this.db.exec('VACUUM');
  }

  getStats() {
    return {
      services: this.countServices(),
      embeddings: this.countEmbeddings(),
      dbSize: this.getDbSize(),
      cachePruned: this.cacheCleanup()
    };
  }

  private getDbSize(): number {
    const stmt = this.db.prepare("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()");
    const result = stmt.get() as { size: number };
    return result.size;
  }
}

// Singleton instance
let dbInstance: SQLiteService | null = null;

export function getDatabase(dbPath?: string): SQLiteService {
  if (!dbInstance) {
    dbInstance = new SQLiteService(dbPath || process.env.DATABASE_PATH || './data/synthex.db');
  }
  return dbInstance;
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
