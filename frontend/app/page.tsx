'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import Logo from '../components/Logo';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Main Content - Vertically Centered */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-20">
        {/* Large Logo/Wordmark */}
        <div className="mb-8">
          <Logo size="large" showText={true} />
        </div>

        {/* Search Bar */}
        <SearchBar size="large" autoFocus={true} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
