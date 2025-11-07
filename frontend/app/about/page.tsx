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
              Synthex continuously scans the x402 ecosystem to discover and index new services in real-time.
              Our AI-powered search delivers intelligent scoring and analysis to help you find exactly what
              you need.
            </p>
          </section>

          {/* How it works */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How It Works</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ecosystem Discovery</h3>
                <p className="text-gray-700 leading-relaxed">
                  We automatically scan the x402 ecosystem to discover and index new services as they become available,
                  ensuring you always have access to the latest offerings.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Comprehensive Data</h3>
                <p className="text-gray-700 leading-relaxed">
                  We provide comprehensive, trustworthy results with transaction metrics,
                  performance data, and reliability scores.
                </p>
              </div>
            </div>
          </section>


          {/* For Service Providers */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">For Service Providers</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Want to improve your service's ranking in Synthex search results? Here's what matters most:
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description Quality</h3>
                <p className="text-gray-700 leading-relaxed">
                  The most important factor for ranking is a clear, detailed description of your service.
                  Explain what your API does, what problems it solves, and what makes it unique.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Complete Metadata</h3>
                <p className="text-gray-700 leading-relaxed">
                  Ensure all fields in your x402 manifest are properly filled: service name, network,
                  pricing information, and technical specifications. Complete metadata helps us better
                  understand and rank your service.
                </p>
              </div>
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
                href="https://github.com/QuantumAgentic/Synthex"
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
