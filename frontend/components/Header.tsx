import Link from 'next/link';
import Logo from './Logo';

interface HeaderProps {
  compact?: boolean;
}

export default function Header({ compact = false }: HeaderProps) {
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo size={compact ? 'small' : 'medium'} showText={true} />

          {/* Navigation Links */}
          <nav className="flex items-center gap-6">
            <Link
              href="/about"
              className="text-sm text-gray-700 hover:text-blue-600 transition-colors"
            >
              About
            </Link>
            <Link
              href="/docs"
              className="text-sm text-gray-700 hover:text-blue-600 transition-colors"
            >
              Documentation
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
