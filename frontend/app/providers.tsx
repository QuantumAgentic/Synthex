'use client';

import React, { useMemo, lazy, Suspense } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { coinbaseWallet, metaMaskWallet } from '@rainbow-me/rainbowkit/wallets';

// Import wallet adapter styles
import '@rainbow-me/rainbowkit/styles.css';
import '@solana/wallet-adapter-react-ui/styles.css';

// Lazy load Solana wallet components
const ConnectionProvider = lazy(() =>
  import('@solana/wallet-adapter-react').then(mod => ({ default: mod.ConnectionProvider }))
);
const WalletProvider = lazy(() =>
  import('@solana/wallet-adapter-react').then(mod => ({ default: mod.WalletProvider }))
);
const WalletModalProvider = lazy(() =>
  import('@solana/wallet-adapter-react-ui').then(mod => ({ default: mod.WalletModalProvider }))
);

// Configure Coinbase Wallet + MetaMask for Base (2 most popular)
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Popular',
      wallets: [
        coinbaseWallet,
        metaMaskWallet,
      ],
    },
  ],
  {
    appName: 'Synthex x402 Search',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  }
);

// Wagmi config for Base (Coinbase Wallet only)
const wagmiConfig = createConfig({
  connectors,
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: false,
});

// React Query client
const queryClient = new QueryClient();

// Lazy load Solana wallet adapters
function useSolanaWallets() {
  return useMemo(async () => {
    const { PhantomWalletAdapter, SolflareWalletAdapter } = await import('@solana/wallet-adapter-wallets');
    return [new PhantomWalletAdapter(), new SolflareWalletAdapter()];
  }, []);
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Solana endpoint (mainnet-beta) - hardcoded to avoid importing @solana/web3.js
  const solanaEndpoint = useMemo(
    () => process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    []
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Suspense fallback={<>{children}</>}>
            <SolanaWalletWrapper endpoint={solanaEndpoint}>
              {children}
            </SolanaWalletWrapper>
          </Suspense>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// Separate component to handle lazy-loaded Solana wallets
function SolanaWalletWrapper({ children, endpoint }: { children: React.ReactNode; endpoint: string }) {
  const [wallets, setWallets] = React.useState<any[]>([]);

  React.useEffect(() => {
    import('@solana/wallet-adapter-wallets').then(({ PhantomWalletAdapter, SolflareWalletAdapter }) => {
      setWallets([new PhantomWalletAdapter(), new SolflareWalletAdapter()]);
    });
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
