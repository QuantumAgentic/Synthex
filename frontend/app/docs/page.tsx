import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function DocsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">API Documentation</h1>
        <p className="text-lg text-gray-600 mb-12">
          Access Synthex Local search engine via REST API
        </p>

        {/* Endpoint */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Endpoint</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-6 font-mono text-sm mb-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-green-400 font-semibold">GET</span>
              <span>http://localhost:3001/search</span>
            </div>
          </div>
          <p className="text-gray-700 text-sm mb-4">
            Simple GET request with query parameter. No authentication required.
          </p>

          <div className="text-sm text-gray-600">
            <strong>Parameters:</strong>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li><code className="bg-gray-100 px-1 py-0.5 rounded">q</code> (string, required) - Your search query</li>
            </ul>
          </div>
        </section>

        {/* Example */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Example Request</h2>

          {/* cURL */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">cURL</h3>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-6 font-mono text-xs overflow-x-auto">
              <pre>{`curl "http://localhost:3001/search?q=weather%20api"`}</pre>
            </div>
          </div>

          {/* JavaScript */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">JavaScript</h3>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-6 font-mono text-xs overflow-x-auto">
              <pre>{`const response = await fetch('http://localhost:3001/search?q=weather+api');
const data = await response.json();

console.log(\`Found \${data.count} services\`);
data.results.forEach(service => {
  console.log(\`\${service.resource}: \${service.description}\`);
});`}</pre>
            </div>
          </div>

          {/* Python */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Python</h3>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-6 font-mono text-xs overflow-x-auto">
              <pre>{`import requests

response = requests.get('http://localhost:3001/search', params={'q': 'weather api'})
data = response.json()

print(f"Found {data['count']} services")
for service in data['results']:
    print(f"{service['resource']}: {service['description']}")`}</pre>
            </div>
          </div>
        </section>

        {/* Response Format */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Response Format</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-6 font-mono text-xs overflow-x-auto">
            <pre>{`{
  "query": "weather api",
  "results": [
    {
      "id": 123,
      "resource": "https://example.com/weather-api",
      "description": "Real-time weather data API",
      "network": "base",
      "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "max_amount": 1000,
      "pay_to": "0xReceiverAddress...",
      "similarity_score": 0.85,
      "final_score": 0.90,
      "trust_transaction_count": 1234
    }
  ],
  "count": 10,
  "timestamp": "2025-01-15T10:30:00.000Z"
}`}</pre>
          </div>
        </section>

        {/* Support */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Local Development</h2>
          <p className="text-gray-700 mb-4">
            This API runs locally on your machine. Make sure the backend is running on port 3001.
          </p>
          <a
            href="/about"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
          >
            Learn More
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
}
