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
    <div>
      {isBase && (
        <div>
          <ConnectButton />
        </div>
      )}

      {isSolana && (
        <div>
          <WalletMultiButton />
        </div>
      )}
    </div>
  );
}
