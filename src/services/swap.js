import axios from 'axios';

const JUP_API_BASE_URL = process.env.JUP_API_BASE_URL || 'https://quote-api.jup.ag/v6';

class SwapService {
  constructor() {
    this.client = axios.create({
      baseURL: JUP_API_BASE_URL,
      timeout: parseInt(process.env.JUP_API_TIMEOUT || '30000'),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async getTokens() {
    try {
      // TODO: Implement token list request to jup.ag API
      return {
        tokens: [
          {
            address: 'SOL',
            symbol: 'SOL',
            name: 'Solana',
            decimals: 9
          },
          {
            address: 'USDC',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to get tokens: ${error.message}`);
    }
  }

  async getTransactions(params = {}) {
    try {
      const { tokenAddress, limit = 10, offset = 0 } = params;
      // TODO: Implement transactions request to jup.ag API
      return {
        transactions: [],
        pagination: {
          limit,
          offset,
          total: 0
        }
      };
    } catch (error) {
      throw new Error(`Failed to get transactions: ${error.message}`);
    }
  }
}

export default new SwapService(); 