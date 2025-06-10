// Simple Solana address validation (base58, 32-44 chars)
export function validateTokenAddress(address) {
  return typeof address === 'string' && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
} 