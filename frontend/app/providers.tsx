'use client';

import React, { useMemo } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { coinbaseWallet } from '@rainbow-me/rainbowkit/wallets';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter styles
import '@rainbow-me/rainbowkit/styles.css';
import '@solana/wallet-adapter-react-ui/styles.css';

// Configure only Coinbase Wallet for Base
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        coinbaseWallet({
          appName: 'Synthex',
          preference: 'smartWalletOnly', // Prefer Smart Wallet
        }),
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

export function Providers({ children }: { children: React.ReactNode }) {
  // Solana wallet adapter (Phantom only - most popular)
  const solanaWallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    []
  );

  // Solana endpoint (mainnet-beta)
  const solanaEndpoint = useMemo(
    () => process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('mainnet-beta'),
    []
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ConnectionProvider endpoint={solanaEndpoint}>
            <WalletProvider wallets={solanaWallets} autoConnect>
              <WalletModalProvider>
                {children}
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
