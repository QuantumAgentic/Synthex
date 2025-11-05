'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface MultiChainConnectProps {
  network: string;
}

export function MultiChainConnect({ network }: MultiChainConnectProps) {
  const isBase = network.includes('base');
  const isSolana = network === 'solana';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-x402-primary/10 flex items-center justify-center">
            <span className="text-xl">🔗</span>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">Connect Wallet</h3>
          <p className="text-sm text-gray-600">
            Required for {network} network
          </p>
        </div>
      </div>

      {isBase && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Base/Ethereum Wallet
          </label>
          <ConnectButton />
        </div>
      )}

      {isSolana && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Solana Wallet
          </label>
          <WalletMultiButton />
        </div>
      )}
    </div>
  );
}
