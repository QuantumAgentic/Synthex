/**
 * X402 Payment utilities for Base and Solana
 */

/**
 * Format amount for display
 */
export function formatAmount(amountString: string, asset: string, network: string): {
  amount: bigint;
  display: string;
  decimals: number;
} {
  const amount = BigInt(amountString);

  // Determine decimals based on network and asset
  let decimals = 18; // Default for ETH

  if (network.includes('base')) {
    // Base network - USDC has 6 decimals
    if (asset.toLowerCase().includes('usdc') || asset === '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913') {
      decimals = 6;
    }
  } else if (network === 'solana') {
    // Solana - SOL has 9 decimals
    decimals = 9;
  }

  // Convert to human-readable
  const divisor = BigInt(10 ** decimals);
  const wholePart = amount / divisor;
  const fractionalPart = amount % divisor;

  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalStr.replace(/0+$/, '');

  const display = trimmedFractional
    ? `${wholePart}.${trimmedFractional}`
    : wholePart.toString();

  // Get asset symbol
  let symbol = 'tokens';
  if (network.includes('base')) {
    symbol = asset.toLowerCase().includes('usdc') ? 'USDC' : 'ETH';
  } else if (network === 'solana') {
    symbol = 'SOL';
  }

  return {
    amount,
    display: `${display} ${symbol}`,
    decimals
  };
}

/**
 * Send payment on Base (EVM)
 * This is a placeholder - actual implementation will use wagmi hooks
 */
export async function sendBasePayment(params: {
  to: string;
  amount: string;
  asset: string;
  wallet: any;
}): Promise<string> {
  // This will be implemented with wagmi hooks in the component
  // For now, return a mock transaction hash
  throw new Error('sendBasePayment must be called from a component with wagmi hooks');
}

/**
 * Send payment on Solana
 * This is a placeholder - actual implementation will use Solana wallet adapter
 */
export async function sendSolanaPayment(params: {
  to: string;
  amount: string;
  wallet: any;
}): Promise<string> {
  // This will be implemented with Solana wallet adapter in the component
  throw new Error('sendSolanaPayment must be called from a component with Solana wallet adapter');
}

/**
 * Sign payment proof for x402 headers
 * This creates a signature to prove payment was made
 */
export async function signPaymentProof(
  wallet: any,
  txHash: string,
  network: string
): Promise<string> {
  const message = `x402-payment-proof:${txHash}:${Date.now()}`;

  if (network.includes('base')) {
    // For EVM wallets, use personal_sign
    // This will be implemented with wagmi in the component
    throw new Error('signPaymentProof must be called from a component with wagmi hooks');
  } else if (network === 'solana') {
    // For Solana wallets, use signMessage
    throw new Error('signPaymentProof must be called from a component with Solana wallet');
  }

  throw new Error('Unsupported network');
}

/**
 * Generate x402 protocol headers
 */
export function generateX402Headers(params: {
  facilitator: string;
  paymentHash: string;
  timestamp: number;
  signature: string;
}): Record<string, string> {
  return {
    'x-x402-facilitator': params.facilitator,
    'x-x402-payment-hash': params.paymentHash,
    'x-x402-timestamp': params.timestamp.toString(),
    'x-x402-signature': params.signature
  };
}

/**
 * Build query string from object
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}
