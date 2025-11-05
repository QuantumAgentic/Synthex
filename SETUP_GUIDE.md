# Synthex Open-Source Setup Guide

## 🎯 What Was Created

A complete local-first, open-source version of Synthex with:
- SQLite database (instead of Vercel Postgres)
- Local AI embeddings via Transformers.js (instead of Nebius API)
- SQLite-based cache (instead of Redis)
- Simplified frontend (no wallet connect, no payment system)
- Easy 4-command setup

## 📦 What's Included

### Backend (`/backend`)

**Core Services:**
- ✅ SQLite database with vector search (`src/services/db/sqlite.ts`)
- ✅ Local embeddings with all-MiniLM-L6-v2 (`src/services/ai/embeddings.ts`)
- ✅ Search service with 3-layer scoring (`src/services/ai/search.ts`)
- ✅ Bazaar aggregator (unchanged from original)
- ✅ Service normalizer (unchanged from original)
- ✅ Express API with routes for search, services, health, stats

**Features:**
- Vector search using cosine similarity
- In-database cache with TTL
- Batch embedding generation
- Automatic database initialization
- Real-time stats endpoint

### Frontend (`/frontend`)

**Copied from original:**
- ✅ All UI components
- ✅ Search interface
- ✅ Service details page
- ✅ Response viewers (JSON, XML, Binary, etc.)
- ✅ Tailwind CSS styling

**Removed:**
- ❌ RainbowKit (Ethereum wallet)
- ❌ Wagmi (Ethereum)
- ❌ Solana Wallet Adapter
- ❌ Payment components
- ❌ All Web3 dependencies

### Scripts (`/scripts`)

- ✅ `setup.js` - One-command installation
- ✅ `init-database.js` - Fetch Bazaar data and generate embeddings

## 🚀 Installation Steps

### Option 1: Automated Setup (Recommended)

```bash
cd synthex-local
npm run setup
```

This will:
1. Create data directories
2. Generate `.env` files
3. Install all dependencies (backend + frontend)
4. Initialize SQLite database
5. Fetch services from Bazaar
6. Generate embeddings for all services

**Time:** 5-10 minutes (depending on internet and CPU)

### Option 2: Manual Setup

```bash
# 1. Create directories
mkdir -p data backend/data

# 2. Create .env files (copy from .env.example)
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 4. Initialize database
node scripts/init-database.js

# 5. Start services
npm run dev
```

## 🎮 Usage

### Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start separately
npm run dev:backend  # Backend only
npm run dev:frontend # Frontend only
```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **Stats**: http://localhost:3001/stats

## 📊 Database Structure

### Tables

**x402_services:**
- Stores all service metadata
- Layer 1 (Foundation): resource, description, network, asset, manifest
- Layer 2A (Trust): transaction_count, last_seen, origin metadata
- Layer 2B (Scoring): confidence, performance, reliability, popularity
- Source tracking: bazaar, x402scan, xgate flags
- Timestamps: last_updated, created_at, updated_at

**x402_embeddings:**
- service_id (FK to x402_services)
- embedding (BLOB) - Float32Array stored as binary
- dimensions (384 for all-MiniLM-L6-v2)

**cache:**
- key (search queries, embeddings)
- value (JSON)
- expiry (Unix timestamp)

## 🔍 Search Flow

1. User enters query: "weather api ethereum"
2. Backend generates embedding (50-100ms)
3. SQLite vector search finds similar services
4. Apply 2-layer scoring:
   - Layer 1 (50%): Data completeness from Bazaar
   - Layer 3 (50%): Semantic similarity
5. Sort by final score
6. Cache results (15 min TTL)
7. Return top N results

## 🧪 Testing

### Manual Tests

```bash
# Test backend health
curl http://localhost:3001/health

# Test search
curl "http://localhost:3001/search?q=weather"

# Get all services
curl http://localhost:3001/services

# Get database stats
curl http://localhost:3001/stats
```

### Expected Performance

- Embedding generation: 50-100ms per query
- Vector search: 10-50ms
- Total search time: 200-400ms
- Database size: 50-100MB for 500 services
- Memory usage: ~200MB runtime

## 🔧 Configuration

### Backend Environment Variables

```bash
PORT=3001                           # Backend server port
NODE_ENV=development                # development | production
DATABASE_PATH=./data/synthex.db     # SQLite database path
ALLOWED_ORIGINS=http://localhost:3000  # CORS origins
EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2  # HuggingFace model
EMBEDDING_DIMENSIONS=384            # Model dimensions
CACHE_SEARCH_TTL=900               # Search cache: 15 min
CACHE_EMBEDDING_TTL=3600           # Embedding cache: 1 hour
POLLING_INTERVAL_MINUTES=15        # Auto-refresh (0=disabled)
```

### Frontend Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001  # Backend API URL
```

## 📝 Key Differences from Original

### Technology Swaps

| Original | Local Version |
|----------|---------------|
| Vercel Postgres + pgvector | SQLite + in-memory vector search |
| Nebius API (Qwen3 embeddings, 4096-dim) | Transformers.js (all-MiniLM-L6-v2, 384-dim) |
| Vercel KV (Redis) | SQLite cache table |
| Vercel deployment | Local Node.js |
| Web3 wallets | None (removed) |
| Payment system | None (removed) |

### Code Changes

**Backend:**
- `src/services/db.ts` → `src/services/db/sqlite.ts` (new implementation)
- `src/services/ai/nebius.ts` → `src/services/ai/embeddings.ts` (local model)
- `src/services/cache.ts` → Integrated in SQLite service
- Removed: `src/services/payment/*`
- Simplified: `src/routes/index.ts` (no payment routes)

**Frontend:**
- Removed: RainbowKit, Wagmi, Solana packages
- Unchanged: All UI components, search interface, response viewers
- Simplified: `package.json` (50% fewer dependencies)

### Features Removed

- ❌ Wallet connect (Ethereum/Solana)
- ❌ Payment processing (Coinbase Commerce, PayAI)
- ❌ Rate limiting (not needed locally)
- ❌ Request logs (simplified for local use)
- ❌ Query enrichment (was already disabled in production)

### Features Kept

- ✅ Bazaar aggregator (100% unchanged)
- ✅ Service normalization
- ✅ 3-layer scoring system
- ✅ Vector search
- ✅ Caching system
- ✅ All frontend UI/UX
- ✅ Response viewers

## 🐛 Troubleshooting

### Database Issues

```bash
# Check database exists
ls -lh backend/data/synthex.db

# Reinitialize database
rm backend/data/synthex.db
node scripts/init-database.js
```

### Embedding Model Not Loading

```bash
# Model downloads on first run (~23MB)
# Check internet connection
# Allow 1-2 minutes for first download

# Model cached in: node_modules/@xenova/transformers/.cache/
```

### Port Already in Use

```bash
# Change ports in .env files
# Backend: PORT=3002
# Frontend: (runs on 3000 by default)
```

### Search Returns No Results

```bash
# Check embeddings exist
curl http://localhost:3001/stats

# Expected: embeddings count should equal services count
# If not, run: node scripts/init-database.js
```

## 📦 Deployment

### Docker (Future)

```bash
# Build image
docker build -t synthex .

# Run container
docker run -p 3000:3000 -p 3001:3001 synthex
```

### Native Binary (Future)

```bash
# Package as standalone executable
npm run build
npm run package
```

## 🤝 Contributing

See main `README.md` for contribution guidelines.

## 📄 License

MIT License - See `LICENSE` file

---

**Ready to start!** Run `npm run setup` and you're good to go! 🚀
