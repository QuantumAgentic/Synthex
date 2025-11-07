import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-gray-200 bg-gray-50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Copyright */}
          <div className="text-sm text-gray-600">
            © {currentYear} Synthex · Powered by{' '}
            <span className="text-blue-600">QuantumAgentic</span>
          </div>

          {/* Right: Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
              About
            </Link>
            <Link href="/docs" className="text-gray-600 hover:text-blue-600 transition-colors">
              API
            </Link>
            <a
              href="https://github.com/QuantumAgentic/Synthex"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://x.com/synthex_x402"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Twitter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
