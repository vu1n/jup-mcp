import axios from 'axios';
import { JUP_API_CONFIG } from '../config/api.js';

class PriceService {
  constructor() {
    this.client = axios.create({
      baseURL: JUP_API_CONFIG.BASE_URL,
      timeout: JUP_API_CONFIG.TIMEOUT,
      headers: JUP_API_CONFIG.HEADERS
    });
  }

  async getPrice(tokenA, tokenB) {
    try {
      const response = await this.client.get(JUP_API_CONFIG.ENDPOINTS.PRICE, {
        params: {
          id: `${tokenA}/${tokenB}`
        }
      });

      return {
        tokenA,
        tokenB,
        price: response.data.data.price,
        timestamp: response.data.data.timestamp,
        vsToken: response.data.data.vsToken
      };
    } catch (error) {
      if (error.response) {
        throw new Error(`Failed to get price: ${error.response.data.message || error.message}`);
      }
      throw new Error(`Failed to get price: ${error.message}`);
    }
  }

  async getPrices(pairs) {
    try {
      const response = await this.client.post(JUP_API_CONFIG.ENDPOINTS.PRICE_BATCH, {
        pairs: pairs.map(({ tokenA, tokenB }) => ({
          id: `${tokenA}/${tokenB}`
        }))
      });

      return response.data.data.map((price, index) => ({
        tokenA: pairs[index].tokenA,
        tokenB: pairs[index].tokenB,
        price: price.price,
        timestamp: price.timestamp,
        vsToken: price.vsToken
      }));
    } catch (error) {
      if (error.response) {
        throw new Error(`Failed to get prices: ${error.response.data.message || error.message}`);
      }
      throw new Error(`Failed to get prices: ${error.message}`);
    }
  }
}

export default new PriceService(); 