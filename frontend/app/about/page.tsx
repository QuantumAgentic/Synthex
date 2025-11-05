import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About Synthex</h1>

        <div className="prose prose-blue max-w-none">
          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Synthesizing the x402 Universe
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Synthex is an AI-powered search engine that aggregates and synthesizes information
              from across the x402 protocol ecosystem. We combine data from multiple authoritative
              sources to provide comprehensive, trustworthy results in seconds.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Instead of manually searching through Coinbase Bazaar, x402scan, and xgate, Synthex
              brings everything together with intelligent scoring and semantic understanding.
            </p>
          </section>

          {/* How it works */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How It Works</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">🔍 Semantic Search</h3>
                <p className="text-gray-700 leading-relaxed">
                  Powered by advanced AI models (Llama 3.1 8B + Qwen3 embeddings), Synthex
                  understands the meaning behind your queries, not just keywords. Search in any
                  language and get relevant results.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">📊 Multi-Layer Scoring</h3>
                <p className="text-gray-700 leading-relaxed">
                  Every service is evaluated across three layers: <strong>Foundation</strong> (data
                  quality), <strong>Trust</strong> (transaction metrics), and{' '}
                  <strong>Performance</strong> (reliability, latency). Combined with AI semantic
                  matching, you get the best results first.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">🌐 Multiple Data Sources</h3>
                <p className="text-gray-700 leading-relaxed">
                  We aggregate from:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li><strong>Coinbase Bazaar</strong> - Official x402 service directory</li>
                  <li><strong>x402scan</strong> - Trust metrics and transaction data</li>
                  <li><strong>xgate</strong> - Performance and reliability metrics</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Free vs API */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Free vs API Access</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Free tier */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-600 mb-3">Website (Free)</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>5 searches per day</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Top 3 results per query</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>AI-powered insights</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Best effort response time</span>
                  </li>
                </ul>
              </div>

              {/* API tier */}
              <div className="border border-blue-500 rounded-lg p-6 bg-blue-50">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">API (Paid)</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>Unlimited searches</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>Up to 50 results per query</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>Advanced filtering & sorting</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>Priority support & SLA</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>Just $0.0001 per search</span>
                  </li>
                </ul>
                <a
                  href="/docs"
                  className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  View API Docs
                </a>
              </div>
            </div>
          </section>

          {/* Technology */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Technology</h2>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <ul className="space-y-3 text-gray-700">
                <li><strong>AI Models:</strong> Llama 3.1 8B (Instruct), Qwen3 Embedding 8B</li>
                <li><strong>Vector Database:</strong> PostgreSQL with pgvector</li>
                <li><strong>Caching:</strong> Redis for sub-second response times</li>
                <li><strong>Payment:</strong> Native x402 protocol (Base + Solana)</li>
                <li><strong>Refresh Cycle:</strong> Real-time updates every 15 minutes</li>
              </ul>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Synthex is built by <strong className="text-blue-600">QuantumAgentic</strong>, a team
              focused on making blockchain services more accessible through AI.
            </p>
            <div className="flex gap-4">
              <a
                href="/docs"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
              >
                API Documentation
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors font-medium"
              >
                GitHub
              </a>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
