import axios from 'axios';

const JUP_API_BASE_URL = process.env.JUP_API_BASE_URL || 'https://quote-api.jup.ag/v6';

class PriceService {
  constructor() {
    this.client = axios.create({
      baseURL: JUP_API_BASE_URL,
      timeout: parseInt(process.env.JUP_API_TIMEOUT || '30000'),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async getPrice(tokenA, tokenB) {
    try {
      // TODO: Implement price request to jup.ag API
      return {
        tokenA,
        tokenB,
        price: '1.0',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to get price: ${error.message}`);
    }
  }

  async getPrices(pairs) {
    try {
      // TODO: Implement multiple prices request to jup.ag API
      return pairs.map(({ tokenA, tokenB }) => ({
        tokenA,
        tokenB,
        price: '1.0',
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      throw new Error(`Failed to get prices: ${error.message}`);
    }
  }
}

export default new PriceService(); 