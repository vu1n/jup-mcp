export const JUP_API_CONFIG = {
  BASE_URL: process.env.JUP_API_BASE_URL || 'https://quote-api.jup.ag/v6',
  ENDPOINTS: {
    QUOTE: '/quote',
    SWAP: '/swap',
    TOKENS: '/tokens',
    PRICE: '/price',
    PRICE_BATCH: '/price/batch',
    TRIGGER: '/trigger',
    RECURRING: '/recurring'
  },
  TIMEOUT: parseInt(process.env.JUP_API_TIMEOUT || '30000'),
  HEADERS: {
    'Content-Type': 'application/json'
  }
}; 