import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function DocsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">API Documentation</h1>
        <p className="text-lg text-gray-600 mb-12">
          Access the full power of Synthex with our x402-powered API
        </p>

        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Overview</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The Synthex API provides programmatic access to our AI-powered x402 service search.
            Every request requires payment via the x402 protocol (Base or Solana).
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Cost:</strong> 0.0001 USDC per search (100,000 wei) · <strong>Networks:</strong> Base (Coinbase CDP) or Solana (PayAI)
            </p>
          </div>
        </section>

        {/* Endpoint */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Endpoint</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-6 font-mono text-sm mb-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-green-400 font-semibold">POST</span>
              <span>https://x402synthex.com/x402/search</span>
            </div>
          </div>
          <p className="text-gray-700 text-sm">
            Requires x402 payment headers (see Payment section below)
          </p>
        </section>

        {/* Request Format */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Request Format</h2>
          <p className="text-gray-700 mb-4">
            Synthex supports two input formats: <strong>Simple</strong> (recommended) and <strong>OpenAI-compatible</strong>.
          </p>

          {/* Simple format */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Simple Format</h3>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-6 font-mono text-sm overflow-x-auto">
              <pre>{`{
  "query": "payment gateway with low fees",
  "limit": 10
}`}</pre>
            </div>
          </div>

          {/* OpenAI format */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">OpenAI-Compatible Format</h3>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-6 font-mono text-sm overflow-x-auto">
              <pre>{`{
  "messages": [
    {
      "role": "user",
      "content": "payment gateway with low fees"
    }
  ],
  "limit": 10
}`}</pre>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <strong>Parameters:</strong>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li><code className="bg-gray-100 px-1 py-0.5 rounded">query</code> (string) - Your search query</li>
              <li><code className="bg-gray-100 px-1 py-0.5 rounded">limit</code> (number, optional) - Number of results (1-50, default: 10)</li>
            </ul>
          </div>
        </section>

        {/* Response Format */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Response Format</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-6 font-mono text-xs overflow-x-auto">
            <pre>{`{
  "id": "x402-search-1234567890",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "x402-synthex-v1",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Based on your search, here are the top services..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 100,
    "completion_tokens": 150,
    "total_tokens": 250
  },
  "x402": {
    "services": [
      {
        "resource": "https://example.com/payment-api",
        "description": "Low-fee payment gateway...",
        "cost": "1000000000000000",
        "network": "ethereum",
        "trust_score": 0.85,
        "performance_score": 0.90,
        "final_score": 0.87
      }
    ],
    "total_found": 10
  }
}`}</pre>
          </div>
        </section>

        {/* Payment */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Payment (x402 Protocol)</h2>
          <p className="text-gray-700 mb-4">
            All requests must include x402 payment proof in headers. We support two facilitators:
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Coinbase CDP */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-600 mb-3">Coinbase CDP (Base)</h3>
              <p className="text-sm text-gray-700 mb-3">Recommended • 0% fee</p>
              <div className="bg-gray-50 p-3 rounded text-xs font-mono mb-3">
                <div className="text-gray-600">Receiver:</div>
                <div className="text-gray-900 break-all">0xYourWalletAddress</div>
              </div>
              <p className="text-xs text-gray-600">
                Cost: 100,000 wei USDC (0.0001 USDC)
              </p>
            </div>

            {/* PayAI */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-600 mb-3">PayAI (Solana)</h3>
              <p className="text-sm text-gray-700 mb-3">~7% facilitator fee</p>
              <div className="bg-gray-50 p-3 rounded text-xs font-mono mb-3">
                <div className="text-gray-600">Receiver:</div>
                <div className="text-gray-900 break-all">YourSolanaAddress</div>
              </div>
              <p className="text-xs text-gray-600">
                Cost: 100,000 lamports (~0.00011 USDC after fee)
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900">
              <strong>Note:</strong> For implementation details on x402 payment headers, refer to the{' '}
              <a href="https://x402.org/docs" target="_blank" rel="noopener noreferrer" className="text-yellow-700 underline">
                official x402 protocol documentation
              </a>.
            </p>
          </div>
        </section>

        {/* Rate Limits */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Rate Limits</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span><strong>100 requests per day</strong> per wallet address</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span><strong>No burst limits</strong> - send requests as fast as needed</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Counter resets daily at 00:00 UTC</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Code Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Code Examples</h2>

          {/* cURL */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">cURL</h3>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-6 font-mono text-xs overflow-x-auto">
              <pre>{`curl -X POST https://x402synthex.com/x402/search \\
  -H "Content-Type: application/json" \\
  -H "X-x402-Payment-Hash: <payment_hash>" \\
  -H "X-x402-Network: base" \\
  -d '{
    "query": "decentralized storage",
    "limit": 5
  }'`}</pre>
            </div>
          </div>

          {/* JavaScript */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">JavaScript</h3>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-6 font-mono text-xs overflow-x-auto">
              <pre>{`const response = await fetch('https://x402synthex.com/x402/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-x402-Payment-Hash': paymentHash,
    'X-x402-Network': 'base'
  },
  body: JSON.stringify({
    query: 'decentralized storage',
    limit: 5
  })
});

const data = await response.json();
console.log(data.x402.services);`}</pre>
            </div>
          </div>

          {/* Python */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Python</h3>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-6 font-mono text-xs overflow-x-auto">
              <pre>{`import requests

response = requests.post(
    'https://x402synthex.com/x402/search',
    headers={
        'Content-Type': 'application/json',
        'X-x402-Payment-Hash': payment_hash,
        'X-x402-Network': 'base'
    },
    json={
        'query': 'decentralized storage',
        'limit': 5
    }
)

data = response.json()
for service in data['x402']['services']:
    print(f"{service['resource']}: {service['final_score']}")`}</pre>
            </div>
          </div>
        </section>

        {/* Support */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Support</h2>
          <p className="text-gray-700 mb-4">
            Need help integrating the API? Have questions about pricing or features?
          </p>
          <a
            href="/about"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
          >
            Get in Touch
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
}
