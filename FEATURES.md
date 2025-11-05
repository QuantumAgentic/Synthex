# Synthex Features

## What's Included

### ✅ Search Features
- **Semantic Search**: Natural language queries using local AI embeddings
- **Vector Similarity**: Fast cosine similarity search in SQLite
- **2-Layer Scoring**:
  - Layer 1 (50%): Bazaar data quality (completeness, metadata)
  - Layer 3 (50%): AI semantic similarity
- **Caching**: 15-minute cache for search results
- **Free API**: No payment required to use Synthex search

### ✅ Web3 Integration
- **Wallet Connection**:
  - Base: Coinbase Wallet (most popular on Base network)
  - Solana: Phantom Wallet (most popular on Solana)
- **Service Testing**: Users can connect their wallet and test external x402 services found in search results
- **x402 Protocol**: Full support for calling and paying for external x402 services

### ✅ Local-First Architecture
- **SQLite Database**: All data stored locally
- **Local Embeddings**: Transformers.js with all-MiniLM-L6-v2 (384-dim, 23MB)
- **No Cloud Dependencies**: Works completely offline (after initial setup)
- **No API Keys Needed**: Everything runs on your machine

### ✅ Developer Experience
- **TypeScript**: Full type safety
- **Hot Reload**: Dev mode with instant updates
- **One-Command Setup**: `npm run setup` does everything
- **Clean Architecture**: Separated concerns, easy to understand

## What's NOT Included

### ❌ Synthex API Payment
- Synthex search API is **FREE** - no payment required
- No rate limiting on search endpoint
- No authentication needed

### ❌ x402scan/xgate Data
- Only uses Bazaar data (Layer 1)
- No trust metrics from x402scan (no Layer 2A)
- No performance data from xgate (no Layer 2B)
- Simplified 2-layer scoring instead of 4-layer

### ❌ Query Enrichment
- No LLM-based query enrichment (was already disabled in production for performance)
- Direct embedding generation from user query

## Use Cases

### 1. Discover x402 Services
Search for AI services using natural language:
```
"weather api for ethereum"
"nft minting service on solana"
"price oracle for base network"
```

### 2. Test Services with Your Wallet
1. Connect your Ethereum or Solana wallet
2. Find a service in search results
3. Click "Test Service"
4. Pay with your connected wallet
5. See the response

### 3. Self-Host a Service Directory
- Run your own x402 service discovery platform
- Customize the UI and branding
- Add your own services to the database
- Fork and extend for specific use cases

## Technical Details

### Frontend Architecture
```
Next.js 14 App Router
├── /app/page.tsx              → Home page with search
├── /app/search/page.tsx       → Search results
├── /app/service/[id]/page.tsx → Service details + testing
└── /components/
    ├── SearchBar.tsx          → Search interface
    ├── wallet/                → Web3 wallet connection
    └── service/               → Service testing UI
```

### Backend Architecture
```
Express.js API
├── /services/db/sqlite.ts     → Database layer
├── /services/ai/
│   ├── embeddings.ts          → Local embedding generation
│   └── search.ts              → Vector search + scoring
├── /services/aggregators/
│   ├── bazaar.ts              → Fetch from Coinbase Bazaar
│   └── normalizer.ts          → Normalize service data
└── /routes/index.ts           → API endpoints (all free)
```

### API Endpoints

**All endpoints are FREE and require no authentication:**

```bash
GET  /health                # Health check
GET  /stats                 # Database statistics
GET  /search?q=<query>      # Semantic search
GET  /services              # List all services
GET  /services/:id          # Get service details
```

### Data Flow

```
1. User Query
   ↓
2. Generate Embedding (local, 50-100ms)
   ↓
3. Vector Search in SQLite
   ↓
4. Calculate Scores:
   - Layer 1: Data quality (50%)
   - Layer 3: Similarity (50%)
   ↓
5. Sort by final score
   ↓
6. Cache result (15 min)
   ↓
7. Return to user
```

### Wallet Integration

**Frontend can:**
- Connect to Ethereum/Base wallets (MetaMask, Coinbase Wallet, etc.)
- Connect to Solana wallets (Phantom, Solflare)
- Sign transactions to pay for external x402 services
- Display wallet balance and transaction history

**Backend does NOT:**
- Verify payments (no payment middleware)
- Track wallet addresses
- Require authentication
- Implement rate limiting

### Service Testing Flow

```
1. User finds service in search results
   ↓
2. Clicks "Test Service" button
   ↓
3. Frontend displays service endpoint and schema
   ↓
4. User fills form with test parameters
   ↓
5. Frontend generates payment proof (if service requires payment)
   ↓
6. User signs transaction with connected wallet
   ↓
7. Frontend calls EXTERNAL service (not Synthex API)
   ↓
8. External service verifies payment and responds
   ↓
9. Frontend displays response to user
```

## Comparison with Production Version

| Feature | Synthex Local | Synthex Production |
|---------|---------------|-------------------|
| **Search API** | Free | Paid (x402 protocol) |
| **Database** | SQLite | Vercel Postgres |
| **Embeddings** | Local (384-dim) | Cloud (4096-dim) |
| **Scoring Layers** | 2 (Bazaar + AI) | 4 (Bazaar + x402scan + xgate + AI) |
| **Cache** | SQLite | Redis (Vercel KV) |
| **Wallet Support** | ✅ Yes | ✅ Yes |
| **Service Testing** | ✅ Yes | ✅ Yes |
| **Rate Limiting** | ❌ No | ✅ Yes |
| **Analytics** | ❌ No | ✅ Yes |
| **Deployment** | Self-hosted | Vercel |

## Future Enhancements

Possible additions for forks:

- [ ] Background polling for auto-refresh
- [ ] Service health monitoring
- [ ] Custom embedding models
- [ ] Multi-language support
- [ ] API authentication (optional)
- [ ] Usage analytics dashboard
- [ ] Docker deployment
- [ ] CLI tool for search

---

**Questions?** See README.md for installation and usage instructions.
