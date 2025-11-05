# Synthex - The Google Search for AI Agents

Synthex is a local-first, open-source semantic search engine for x402 protocol services. It combines AI-powered embeddings with a sophisticated 3-layer scoring system to help you discover the best AI services for your needs.

## ✨ Features

- **🔍 Semantic Search**: Natural language queries powered by local AI embeddings
- **🗄️ Local-First**: All data stored in SQLite, no cloud dependencies
- **🤖 Local AI**: Runs embeddings locally using Transformers.js (no API keys needed)
- **⚡ Fast**: Vector search with in-memory caching for instant results
- **📊 Smart Scoring**: 2-layer scoring system (Bazaar Quality + AI Similarity)
- **🌐 Real-Time Data**: Fetches latest services from Coinbase Bazaar
- **💰 Web3 Wallets**: Connect Ethereum (Base) or Solana wallets to test services
- **🎨 Clean UI**: Modern Next.js frontend with Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- ~500MB disk space for database and models

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/synthex.git
cd synthex

# Run the setup script (installs deps, downloads models, initializes DB)
npm run setup

# Start both frontend and backend
npm run dev
```

That's it! Synthex will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Manual Installation (if setup script fails)

```bash
# Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Initialize database
node scripts/init-database.js

# Start backend (terminal 1)
cd backend && npm run dev

# Start frontend (terminal 2)
cd frontend && npm run dev
```

## 📖 Usage

### Search for Services

Open http://localhost:3000 and enter a natural language query:

```
"weather api for ethereum"
"nft minting service on solana"
"price oracle for base network"
```

### API Endpoints

```bash
# Search
curl "http://localhost:3001/search?q=weather"

# Get all services
curl "http://localhost:3001/services"

# Get service by ID
curl "http://localhost:3001/services/1"

# Health check
curl "http://localhost:3001/health"

# Statistics
curl "http://localhost:3001/stats"
```

## 🏗️ Architecture

### Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- TypeScript
- RainbowKit + Wagmi (Ethereum/Base wallets)
- Solana Wallet Adapter (Phantom, Solflare)

**Backend:**
- Express.js
- TypeScript
- SQLite + better-sqlite3
- Transformers.js (local AI embeddings)

**Data Sources:**
- Coinbase Bazaar API (x402 services)

### How It Works

1. **Data Collection**: Fetches services from Coinbase Bazaar API
2. **Normalization**: Extracts structured data and metadata
3. **Embedding Generation**: Creates 384-dimensional vectors using all-MiniLM-L6-v2
4. **Vector Storage**: Stores embeddings in SQLite for fast similarity search
5. **Search**: Combines semantic similarity with data quality scoring
6. **Ranking**: Returns best matches based on relevance and metadata quality

### Scoring System

Since we only have Bazaar data (no x402scan or xgate), we use a simplified 2-layer scoring:

```
Final Score = (Layer1 × 0.5) + (Layer3 × 0.5)

Layer 1 (Bazaar Quality): Data completeness and metadata quality from Bazaar
Layer 3 (AI Similarity): Semantic similarity to user query
```

## 📂 Project Structure

```
synthex/
├── frontend/              # Next.js frontend
│   ├── app/              # App router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities
│   └── public/           # Static assets
├── backend/              # Express.js backend
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   │   ├── aggregators/  # Data fetching (Bazaar)
│   │   │   ├── ai/           # Embeddings & search
│   │   │   └── db/           # Database layer (SQLite)
│   │   ├── config/       # Configuration
│   │   └── types/        # TypeScript types
│   └── data/             # SQLite database
├── scripts/              # Setup & maintenance scripts
└── package.json          # Monorepo root
```

## ⚙️ Configuration

### Backend (.env)

```bash
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_PATH=./data/synthex.db

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Embedding Model
EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2
EMBEDDING_DIMENSIONS=384

# Cache
CACHE_SEARCH_TTL=900       # 15 minutes
CACHE_EMBEDDING_TTL=3600   # 1 hour

# Polling (optional)
POLLING_INTERVAL_MINUTES=15
```

### Frontend (.env)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🔧 Maintenance

### Update Services

```bash
# Re-fetch services from Bazaar and regenerate embeddings
node scripts/init-database.js
```

### Clear Cache

```bash
# Start backend and the cache will auto-cleanup expired entries
cd backend && npm run dev
```

### Database Stats

```bash
curl http://localhost:3001/stats
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

```bash
# Install dependencies
npm install

# Start in dev mode (hot reload)
npm run dev

# Build for production
npm run build
npm start
```

### Code Style

- TypeScript for type safety
- ESLint + Prettier for formatting
- Conventional commits for commit messages

## 📊 Performance

- **Embedding Generation**: ~50-100ms per service (local CPU)
- **Vector Search**: ~10-50ms (in-memory SQLite)
- **Search Query**: ~200-400ms total (including embedding generation)
- **Database Size**: ~50-100MB for 500 services
- **Memory Usage**: ~200MB runtime

## 🎯 Roadmap

- [ ] Background service polling
- [ ] Advanced filtering (network, asset, price range)
- [ ] Service uptime monitoring
- [ ] Custom embedding models
- [ ] Multi-language support
- [ ] API authentication (optional)
- [ ] Docker deployment
- [ ] CLI tool

## 📝 License

MIT License - see [LICENSE](LICENSE) for details

## 🙏 Acknowledgments

- [Coinbase Bazaar](https://bazaar.x402.network) for x402 service data
- [Transformers.js](https://github.com/xenova/transformers.js) for local AI embeddings
- [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) embedding model
- [x402 Protocol](https://x402.network) for the service standard

## 🐛 Issues & Support

Found a bug or have a question? Please open an issue on GitHub:
https://github.com/yourusername/synthex/issues

## 🌟 Star History

If you find Synthex useful, please consider giving it a star on GitHub!

---

Built with ❤️ by the Synthex Team
