# 🚀 Synthex Quick Start

## Installation (4 commands)

```bash
cd synthex-local
npm run setup
npm run dev
# Open http://localhost:3000
```

## Project Structure

```
synthex-local/
├── backend/              # Express + SQLite + Local AI
│   ├── src/
│   │   ├── services/db/sqlite.ts      # Database layer
│   │   ├── services/ai/embeddings.ts  # Local embeddings
│   │   ├── services/ai/search.ts      # Search + scoring
│   │   └── routes/index.ts            # API endpoints
│   └── data/synthex.db   # SQLite database
├── frontend/             # Next.js UI (unchanged)
├── scripts/
│   ├── setup.js          # One-command setup
│   └── init-database.js  # Database initialization
└── README.md
```

## Tech Stack

**Backend:**
- Express.js + TypeScript
- SQLite + better-sqlite3 (database)
- Transformers.js (local AI embeddings)
- all-MiniLM-L6-v2 (384-dim embedding model)

**Frontend:**
- Next.js 14 + React 18
- Tailwind CSS
- No Web3 dependencies

**Data:**
- Coinbase Bazaar API (x402 services)

## API Endpoints

```bash
GET /search?q=weather              # Search services
GET /services                      # List all services
GET /services/:id                  # Get service details
GET /health                        # Health check
GET /stats                         # Database statistics
```

## Search Example

```bash
# Terminal
curl "http://localhost:3001/search?q=ethereum%20price"

# Browser
http://localhost:3000
# Type: "ethereum price oracle"
```

## Configuration

**Backend** (`backend/.env`):
```bash
PORT=3001
DATABASE_PATH=./data/synthex.db
EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2
CACHE_SEARCH_TTL=900
```

**Frontend** (`frontend/.env`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Development Commands

```bash
npm run dev              # Start both frontend + backend
npm run dev:backend      # Backend only
npm run dev:frontend     # Frontend only
npm run build            # Build for production
node scripts/init-database.js  # Refresh database
```

## What's Different from Original?

| Original | Local Version |
|----------|---------------|
| Vercel Postgres | SQLite |
| Nebius API (cloud) | Transformers.js (local) |
| Redis cache | SQLite cache |
| Web3 wallets | Removed |
| Payment system | Removed |
| 12+ env vars | 6 env vars |

## Performance

- **Search**: 200-400ms total
- **Embedding**: 50-100ms per query
- **Database**: ~100MB for 500 services
- **Memory**: ~200MB runtime

## Troubleshooting

**"Port 3001 already in use"**
```bash
# Change PORT in backend/.env
PORT=3002
```

**"No search results"**
```bash
# Check database initialized
curl http://localhost:3001/stats
# Should show: services > 0, embeddings > 0

# If not, reinitialize
node scripts/init-database.js
```

**"Model download slow"**
```bash
# First run downloads 23MB model
# Wait 1-2 minutes
# Cached in: node_modules/@xenova/transformers/.cache/
```

## Next Steps

1. ✅ Run setup: `npm run setup`
2. ✅ Start dev: `npm run dev`
3. ✅ Open browser: http://localhost:3000
4. ✅ Try a search: "weather api"
5. ✅ Check API: http://localhost:3001/health

## Documentation

- Full docs: `README.md`
- Setup guide: `SETUP_GUIDE.md`
- License: `LICENSE` (MIT)

---

**Questions?** Open an issue on GitHub!
